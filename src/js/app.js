// State Store
const state = {
  ingredients: new Set(['bread', 'milk']),
  savedRecipes: JSON.parse(localStorage.getItem('pantry_saved_recipes') || '[]'),
  currentRecipes: [],
  isLoading: false
}

// DOM Elements
const tagsWrapper = document.getElementById('tags-wrapper')
const ingredientInput = document.getElementById('ingredient-input')
const tagsContainer = document.getElementById('tags-container')
const presetsCloud = document.getElementById('presets-cloud')
const btnClearAll = document.getElementById('btn-clear-all')
const btnGenerate = document.getElementById('btn-generate')
const btnRegenerate = document.getElementById('btn-regenerate')
const statusContainer = document.getElementById('status-container')
const recipesGrid = document.getElementById('recipes-grid')
const resultsHeader = document.getElementById('results-header')
const resultsMetaText = document.getElementById('results-meta-text')
const selectMealType = document.getElementById('select-meal-type')
const selectDietary = document.getElementById('select-dietary')
const selectTime = document.getElementById('select-time')
const savedModal = document.getElementById('saved-modal')
const btnToggleSaved = document.getElementById('btn-toggle-saved')
const btnCloseSaved = document.getElementById('btn-close-saved')
const savedRecipesContainer = document.getElementById('saved-recipes-container')
const savedCount = document.getElementById('saved-count')

// ==========================================================================
// Initialization
// ==========================================================================
function init() {
  renderTags()
  updatePresetChips()
  updateSavedCount()
  setupEventListeners()
}

// ==========================================================================
// Tag Management
// ==========================================================================
function renderTags() {
  tagsWrapper.innerHTML = ''
  state.ingredients.forEach(ing => {
    const tag = document.createElement('span')
    tag.className = 'tag-badge'
    tag.innerHTML = `
      <span>${escapeHtml(ing)}</span>
      <button type="button" class="tag-remove-btn" data-ingredient="${escapeHtml(ing)}" aria-label="Remove ${escapeHtml(ing)}">&times;</button>
    `
    tagsWrapper.appendChild(tag)
  })
}

function addIngredient(val) {
  const cleaned = val.trim().toLowerCase()
  if (cleaned && !state.ingredients.has(cleaned)) {
    state.ingredients.add(cleaned)
    renderTags()
    updatePresetChips()
  }
}

function removeIngredient(val) {
  state.ingredients.delete(val)
  renderTags()
  updatePresetChips()
}

function updatePresetChips() {
  document.querySelectorAll('.preset-chip').forEach(chip => {
    const ing = chip.dataset.ingredient.toLowerCase()
    chip.classList.toggle('active', state.ingredients.has(ing))
  })
}

function clearAllIngredients() {
  state.ingredients.clear()
  renderTags()
  updatePresetChips()
  ingredientInput.focus()
}

// ==========================================================================
// Event Listeners
// ==========================================================================
function setupEventListeners() {
  // Focus input when clicking tag container background
  tagsContainer.addEventListener('click', e => {
    if (e.target === tagsContainer || e.target === tagsWrapper) {
      ingredientInput.focus()
    }
  })

  // Enter or comma adds tag; backspace on empty deletes last tag
  ingredientInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (ingredientInput.value.trim()) {
        addIngredient(ingredientInput.value)
        ingredientInput.value = ''
      }
    } else if (
      e.key === 'Backspace' &&
      ingredientInput.value === '' &&
      state.ingredients.size > 0
    ) {
      const items = Array.from(state.ingredients)
      removeIngredient(items[items.length - 1])
    }
  })

  // Remove tag button
  tagsWrapper.addEventListener('click', e => {
    const btn = e.target.closest('.tag-remove-btn')
    if (btn) {
      removeIngredient(btn.dataset.ingredient)
    }
  })

  // Preset chips click
  presetsCloud.addEventListener('click', e => {
    const chip = e.target.closest('.preset-chip')
    if (chip) {
      const ing = chip.dataset.ingredient.toLowerCase()
      if (state.ingredients.has(ing)) {
        removeIngredient(ing)
      } else {
        addIngredient(ing)
      }
    }
  })

  // Clear all button
  btnClearAll.addEventListener('click', clearAllIngredients)

  // Generate buttons
  btnGenerate.addEventListener('click', handleGenerate)
  if (btnRegenerate) {
    btnRegenerate.addEventListener('click', handleGenerate)
  }

  // Saved Modal
  btnToggleSaved.addEventListener('click', openSavedModal)
  btnCloseSaved.addEventListener('click', closeSavedModal)
  savedModal.addEventListener('click', e => {
    if (e.target === savedModal) closeSavedModal()
  })

  // Delegate Recipe Card actions (Favorite, Copy, Checklist)
  recipesGrid.addEventListener('click', handleRecipeCardClick)
  savedRecipesContainer.addEventListener('click', handleRecipeCardClick)
}

// ==========================================================================
// Recipe Generation
// ==========================================================================
async function handleGenerate() {
  if (state.isLoading) return

  const ingredientsList = Array.from(state.ingredients)
  if (ingredientsList.length === 0) {
    showStatus('Please add at least one ingredient to generate recipes.', 'error')
    ingredientInput.focus()
    return
  }

  setLoading(true)
  showStatus('', '') // clear
  renderSkeletons()

  const options = {
    mealType: selectMealType.value,
    dietary: selectDietary.value,
    cookingTime: selectTime.value,
    count: 2
  }

  try {
    const res = await fetch('/api/generate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: ingredientsList,
        options
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate recipe.')
    }

    state.currentRecipes = data.recipes || []
    renderRecipes(state.currentRecipes, data.modelUsed)
    showStatus(
      `✨ Generated ${state.currentRecipes.length} recipes using Gemini (${data.modelUsed})`,
      'info'
    )

    // Smooth scroll down to results
    resultsHeader.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    console.error('Error generating recipe:', err)
    showStatus(`Error: ${err.message}`, 'error')
    recipesGrid.innerHTML = `
      <div class="alert-card alert-error" style="grid-column: 1 / -1;">
        <span>❌ Could not complete generation: ${escapeHtml(err.message)}</span>
      </div>
    `
  } finally {
    setLoading(false)
  }
}

function setLoading(isLoading) {
  state.isLoading = isLoading
  btnGenerate.disabled = isLoading
  if (isLoading) {
    btnGenerate.innerHTML = `<span class="btn-icon">⏳</span><span class="btn-text">Chef Gemini is cooking...</span>`
  } else {
    btnGenerate.innerHTML = `<span class="btn-icon">✨</span><span class="btn-text">Generate Recipes with Gemini</span>`
  }
}

function showStatus(message, type) {
  if (!message) {
    statusContainer.innerHTML = ''
    return
  }
  statusContainer.innerHTML = `
    <div class="alert-card alert-${type}">
      <span>${escapeHtml(message)}</span>
    </div>
  `
}

// ==========================================================================
// Rendering
// ==========================================================================
function renderSkeletons() {
  resultsHeader.style.display = 'flex'
  resultsMetaText.textContent = 'Designing recipes with balanced nutrition and culinary flair...'
  recipesGrid.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-shimmer skeleton-title"></div>
      <div class="skeleton-shimmer skeleton-line"></div>
      <div class="skeleton-shimmer skeleton-line short"></div>
      <div class="skeleton-shimmer skeleton-block"></div>
      <div class="skeleton-shimmer skeleton-block"></div>
    </div>
    <div class="skeleton-card">
      <div class="skeleton-shimmer skeleton-title"></div>
      <div class="skeleton-shimmer skeleton-line"></div>
      <div class="skeleton-shimmer skeleton-line short"></div>
      <div class="skeleton-shimmer skeleton-block"></div>
      <div class="skeleton-shimmer skeleton-block"></div>
    </div>
  `
}

function renderRecipes(recipes, modelUsed) {
  resultsHeader.style.display = 'flex'
  resultsMetaText.textContent = `Featuring: ${Array.from(state.ingredients).join(', ')} • Engine: ${modelUsed || 'Gemini'}`
  recipesGrid.innerHTML = ''

  recipes.forEach((recipe, idx) => {
    recipesGrid.appendChild(createRecipeCardElement(recipe, idx))
  })
}

function createRecipeCardElement(recipe, idx) {
  const card = document.createElement('article')
  card.className = 'recipe-card'
  card.id = `recipe-${recipe.id || idx}`

  const isSaved = state.savedRecipes.some(r => r.title === recipe.title)

  const ingredientsHtml = (recipe.allIngredientsWithMeasurements || [])
    .map(
      (item, i) => `
      <li class="ingredient-item">
        <label>
          <input type="checkbox" id="check-${recipe.id || idx}-${i}" />
          <span>${escapeHtml(item)}</span>
        </label>
      </li>
    `
    )
    .join('')

  const instructionsHtml = (recipe.instructions || [])
    .map(
      (step, sIdx) => `
      <li class="instruction-step">
        <span class="step-num">${sIdx + 1}</span>
        <span>${escapeHtml(step)}</span>
      </li>
    `
    )
    .join('')

  const tagsHtml = (recipe.dietaryTags || [])
    .map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`)
    .join('')

  card.innerHTML = `
    <div class="recipe-card-header">
      <div class="recipe-meta-row">
        <span class="recipe-category">${escapeHtml(recipe.category || 'Recipe')}</span>
        <button
          type="button"
          class="btn-favorite ${isSaved ? 'active' : ''}"
          data-title="${escapeHtml(recipe.title)}"
          title="${isSaved ? 'Remove from saved' : 'Save to favorites'}"
          aria-label="Save to favorites"
        >
          ${isSaved ? '★' : '☆'}
        </button>
      </div>
      <h3 class="recipe-title">${escapeHtml(recipe.title)}</h3>
      <p class="recipe-tagline">${escapeHtml(recipe.tagline || '')}</p>
    </div>

    <div class="recipe-metrics">
      <div class="metric-item">
        <span>⏱️</span>
        <span class="metric-value">${escapeHtml(recipe.totalTime || '20 mins')}</span>
      </div>
      <div class="metric-item">
        <span>🍽️</span>
        <span class="metric-value">${recipe.servings || 2} servings</span>
      </div>
      <div class="metric-item">
        <span>👨‍🍳</span>
        <span class="metric-value">${escapeHtml(recipe.difficulty || 'Easy')}</span>
      </div>
    </div>

    <div class="recipe-body">
      <div>
        <h4 class="recipe-section-title">🛒 Ingredients & Checklist</h4>
        <ul class="ingredients-checklist">
          ${ingredientsHtml}
        </ul>
      </div>

      <div>
        <h4 class="recipe-section-title">📋 Step-by-Step Instructions</h4>
        <ol class="instructions-list">
          ${instructionsHtml}
        </ol>
      </div>

      ${
        recipe.chefTip
          ? `
        <div class="chef-tip-box">
          <strong>💡 Chef's Secret Tip:</strong> ${escapeHtml(recipe.chefTip)}
        </div>
      `
          : ''
      }
    </div>

    <div class="recipe-card-footer">
      <div class="tag-list">
        ${tagsHtml}
      </div>
      <button type="button" class="btn-copy" data-title="${escapeHtml(recipe.title)}">
        📋 Copy Recipe
      </button>
    </div>
  `

  return card
}

// ==========================================================================
// Interactive Actions (Favorites, Copy, Checklist)
// ==========================================================================
function handleRecipeCardClick(e) {
  // Favorite toggle
  const favBtn = e.target.closest('.btn-favorite')
  if (favBtn) {
    const title = favBtn.dataset.title
    toggleFavorite(title, favBtn)
    return
  }

  // Copy recipe to clipboard
  const copyBtn = e.target.closest('.btn-copy')
  if (copyBtn) {
    const title = copyBtn.dataset.title
    copyRecipeToClipboard(title, copyBtn)
    return
  }

  // Checkbox toggle text strike-through
  if (e.target.matches('input[type="checkbox"]')) {
    const parentLi = e.target.closest('.ingredient-item')
    if (parentLi) {
      parentLi.classList.toggle('checked', e.target.checked)
    }
  }
}

function toggleFavorite(title, btn) {
  const existingIdx = state.savedRecipes.findIndex(r => r.title === title)
  if (existingIdx > -1) {
    state.savedRecipes.splice(existingIdx, 1)
    btn.classList.remove('active')
    btn.textContent = '☆'
  } else {
    const recipeObj =
      state.currentRecipes.find(r => r.title === title) ||
      state.savedRecipes.find(r => r.title === title)
    if (recipeObj) {
      state.savedRecipes.push(recipeObj)
      btn.classList.add('active')
      btn.textContent = '★'
    }
  }

  localStorage.setItem('pantry_saved_recipes', JSON.stringify(state.savedRecipes))
  updateSavedCount()

  // If saved modal is currently open, refresh it
  if (savedModal.style.display !== 'none') {
    renderSavedModalContent()
  }
}

function updateSavedCount() {
  savedCount.textContent = state.savedRecipes.length
}

async function copyRecipeToClipboard(title, btn) {
  const recipe =
    state.currentRecipes.find(r => r.title === title) ||
    state.savedRecipes.find(r => r.title === title)
  if (!recipe) return

  const text = `
🍳 ${recipe.title}
"${recipe.tagline || ''}"

⏱️ Total Time: ${recipe.totalTime || '20m'} | 🍽️ Servings: ${recipe.servings || 2} | Difficulty: ${recipe.difficulty || 'Easy'}

🛒 INGREDIENTS:
${(recipe.allIngredientsWithMeasurements || []).map(i => `• ${i}`).join('\n')}

📋 INSTRUCTIONS:
${(recipe.instructions || []).map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

💡 CHEF'S TIP:
${recipe.chefTip || 'Enjoy hot!'}

Generated with Gemini AI PantryGen
`.trim()

  try {
    await navigator.clipboard.writeText(text)
    const originalText = btn.textContent
    btn.textContent = '✅ Copied!'
    setTimeout(() => {
      btn.textContent = originalText
    }, 2000)
  } catch (err) {
    console.error('Clipboard error:', err)
  }
}

// ==========================================================================
// Saved Modal Dialog
// ==========================================================================
function openSavedModal() {
  savedModal.style.display = 'flex'
  savedModal.setAttribute('aria-hidden', 'false')
  renderSavedModalContent()
}

function closeSavedModal() {
  savedModal.style.display = 'none'
  savedModal.setAttribute('aria-hidden', 'true')
}

function renderSavedModalContent() {
  if (state.savedRecipes.length === 0) {
    savedRecipesContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
        <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌟</p>
        <p>No saved recipes yet!</p>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">Click the star icon on any generated recipe card to bookmark it here.</p>
      </div>
    `
    return
  }

  savedRecipesContainer.innerHTML = ''
  state.savedRecipes.forEach((recipe, idx) => {
    savedRecipesContainer.appendChild(createRecipeCardElement(recipe, idx))
  })
}

// Utility: HTML Escaping
function escapeHtml(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Boot application
init()
