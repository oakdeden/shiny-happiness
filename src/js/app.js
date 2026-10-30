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
const inputServings = document.getElementById('input-servings')
const equipmentChips = document.getElementById('equipment-chips')
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
  updateApiKeyButtonState()
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

  // API Key Button (for client-side GitHub Pages execution)
  const btnApiKey = document.getElementById('btn-api-key')
  if (btnApiKey) {
    btnApiKey.addEventListener('click', handleApiKeyConfig)
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

function updateApiKeyButtonState() {
  const btnApiKey = document.getElementById('btn-api-key')
  if (btnApiKey) {
    const hasKey = Boolean(localStorage.getItem('gemini_api_key'))
    btnApiKey.textContent = hasKey ? '🔑 API Key ✓' : '🔑 API Key'
    btnApiKey.title = hasKey
      ? 'Gemini API Key configured. Click to view or change.'
      : 'Click to configure Gemini API Key for GitHub Pages.'
  }
}

function handleApiKeyConfig() {
  const existingKey = localStorage.getItem('gemini_api_key') || ''
  const displayExisting = existingKey ? `${existingKey.slice(0, 6)}...${existingKey.slice(-4)}` : ''
  const promptMsg = existingKey
    ? `Current Gemini API Key: ${displayExisting}\n\nEnter a new Gemini API Key (or leave empty and click OK to remove):`
    : `Enter your Google Gemini API Key for client-side recipe generation on GitHub Pages:\n\n(Get a free key at https://aistudio.google.com/app/apikey)`

  const result = prompt(promptMsg, existingKey)
  if (result !== null) {
    const cleaned = result.trim()
    if (cleaned) {
      localStorage.setItem('gemini_api_key', cleaned)
      updateApiKeyButtonState()
      showStatus('✅ Gemini API Key saved to browser storage.', 'info')
    } else {
      localStorage.removeItem('gemini_api_key')
      updateApiKeyButtonState()
      showStatus('ℹ️ Stored Gemini API Key cleared.', 'info')
    }
  }
}

function buildRecipePrompt(ingredients, options = {}) {
  const count = Math.min(Math.max(options.count || 2, 1), 3)
  const mealType =
    options.mealType && options.mealType !== 'any' ? `Meal type: ${options.mealType}.` : ''
  const dietary =
    options.dietary && options.dietary !== 'none' ? `Dietary preference: ${options.dietary}.` : ''
  const cookingTime =
    options.cookingTime && options.cookingTime !== 'any'
      ? `Cooking time target: ${options.cookingTime}.`
      : ''
  const servings = options.servings && options.servings > 0 ? options.servings : 2
  const equipment =
    options.equipment && options.equipment.length > 0
      ? `Available cooking equipment: ${options.equipment.join(', ')}.`
      : 'Available cooking equipment: stovetop (standard kitchen setup).'

  return `You are an expert culinary chef and recipe developer.
Given the following provided primary ingredients (these are foods/flavourings only — treat them as cooking ingredients):
${JSON.stringify(ingredients)}

${mealType}
${dietary}
${cookingTime}
Scale each recipe for ${servings} serving${servings === 1 ? '' : 's'}.
${equipment}

Create ${count} creative, delicious, and realistic recipe ideas that feature these ingredients prominently.
Only suggest cooking methods that require the listed available equipment.
You may assume common pantry staples (salt, pepper, butter/oil, sugar, water, basic spices) are available.

Return ONLY a valid JSON object matching this exact structure:
{
  "recipes": [
    {
      "id": "kebab-case-slug",
      "title": "Creative Recipe Title",
      "tagline": "Vibrant 1-sentence description",
      "category": "Breakfast | Dessert | Savory | Comfort Food",
      "prepTime": "10 mins",
      "cookTime": "15 mins",
      "totalTime": "25 mins",
      "servings": ${servings},
      "difficulty": "Easy | Medium | Advanced",
      "dietaryTags": ["Vegetarian", "Quick & Easy"],
      "primaryIngredients": ["bread", "milk"],
      "pantryIngredients": ["cinnamon", "butter", "sugar"],
      "allIngredientsWithMeasurements": [
        "4 slices stale bread",
        "1 cup warm milk",
        "1 tbsp melted butter"
      ],
      "instructions": [
        "Step 1 description...",
        "Step 2 description...",
        "Step 3 description..."
      ],
      "chefTip": "Professional cooking secret or variation tip",
      "nutritionalHighlight": "Brief calorie/protein/vitamin note"
    }
  ]
}
Do not include any conversational preamble or markdown backticks, return only the raw JSON.`
}

async function generateRecipesClientSide(ingredients, options, apiKey) {
  const prompt = buildRecipePrompt(ingredients, options)
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash'
  ]

  let lastError = null

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.error?.message || `Gemini API returned HTTP ${res.status}`
        if (errorMsg.includes('API key') || errorMsg.includes('API_KEY')) {
          throw new Error(
            `API key issue: ${errorMsg}. Click "🔑 API Key" in the top bar to update.`
          )
        }
        throw new Error(`[${model}] ${errorMsg}`)
      }

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      let cleanedJson = rawText.trim()
      const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
      if (codeBlockMatch) {
        cleanedJson = codeBlockMatch[1].trim()
      } else {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleanedJson = jsonMatch[0].trim()
        }
      }

      const parsed = JSON.parse(cleanedJson)
      if (parsed && Array.isArray(parsed.recipes)) {
        return {
          recipes: parsed.recipes,
          modelUsed: `${model} (Client Direct)`
        }
      }
    } catch (err) {
      console.warn(`Model ${model} error:`, err.message)
      lastError = err
      if (err.message.includes('API key issue')) {
        throw err
      }
      continue
    }
  }

  throw new Error(
    `Direct Gemini API call failed: ${lastError ? lastError.message : 'Unknown error'}`
  )
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

  // Read servings (clamp 1–12, default 2)
  const servingsRaw = parseInt(inputServings?.value, 10)
  const servings = Number.isFinite(servingsRaw) ? Math.min(Math.max(servingsRaw, 1), 12) : 2

  // Read checked equipment checkboxes
  const equipment = equipmentChips
    ? Array.from(equipmentChips.querySelectorAll('input[type="checkbox"]:checked')).map(
        cb => cb.value
      )
    : []

  const options = {
    mealType: selectMealType.value,
    dietary: selectDietary.value,
    cookingTime: selectTime.value,
    servings,
    equipment,
    count: 2
  }

  const isPort3003 = window.location.port === '3003'
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'

  try {
    let data = null
    let modelUsed = ''

    // 1. If running locally, attempt to query the local Node recipe-generator server
    if (isLocalhost) {
      let res = null

      try {
        res = await fetch('/api/generate-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: ingredientsList,
            options
          })
        })
      } catch {
        // relative request failed
      }

      // If relative endpoint didn't respond with JSON and we're not on port 3003, try direct port 3003
      if ((!res || !res.ok) && !isPort3003) {
        try {
          const directRes = await fetch('http://localhost:3003/api/generate-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredients: ingredientsList,
              options
            })
          })
          if (directRes.ok && directRes.headers.get('content-type')?.includes('application/json')) {
            res = directRes
          }
        } catch {
          // direct request failed
        }
      }

      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        data = await res.json()
        modelUsed = data.modelUsed
      }
    }

    // 2. If data was not obtained from local server (e.g. GitHub Pages static host, or local server not running):
    // Fall back to direct client-side Gemini generation!
    if (!data) {
      let apiKey = localStorage.getItem('gemini_api_key') || ''
      if (!apiKey) {
        apiKey = prompt(
          '🔑 GitHub Pages is a static host without a backend server.\n\nPlease enter your Google Gemini API Key to generate recipes directly:\n\n(It will be safely saved in your browser localStorage)'
        )
        if (apiKey && apiKey.trim()) {
          apiKey = apiKey.trim()
          localStorage.setItem('gemini_api_key', apiKey)
          updateApiKeyButtonState()
        }
      }

      if (!apiKey) {
        setLoading(false)
        recipesGrid.innerHTML = ''
        showStatus(
          '⚠️ A Gemini API Key is required for GitHub Pages. Click "🔑 API Key" in the header to enter your key.',
          'error'
        )
        return
      }

      showStatus('✨ Generating recipes directly with Google Gemini AI...', 'info')
      const clientResult = await generateRecipesClientSide(ingredientsList, options, apiKey)
      data = { recipes: clientResult.recipes }
      modelUsed = clientResult.modelUsed
    }

    state.currentRecipes = data.recipes || []
    renderRecipes(state.currentRecipes, modelUsed)
    showStatus(
      `✨ Generated ${state.currentRecipes.length} recipes using Gemini (${modelUsed})`,
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
