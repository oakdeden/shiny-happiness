import { GoogleGenAI } from '@google/genai'
import { fileURLToPath } from 'url'
import path from 'path'

// Load environment file if running in Node 20+
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile()
  } catch {
    // If not found in current folder, try parent folder
    try {
      const parentEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env')
      process.loadEnvFile(parentEnv)
    } catch {
      // Ignore if no .env is available
    }
  }
}

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite'
]

/**
 * Generates culinary recipes based on an array of ingredient strings.
 *
 * @param {string[]} ingredients - Array of ingredient strings, e.g. ['bread', 'milk']
 * @param {Object} [options={}] - Customization options
 * @param {string} [options.mealType='any'] - e.g. 'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'any'
 * @param {string} [options.dietary='none'] - e.g. 'none', 'vegetarian', 'vegan', 'high-protein'
 * @param {string} [options.cookingTime='any'] - e.g. 'under 15 mins', 'under 30 mins', 'any'
 * @param {number} [options.count=2] - Number of recipe variations (1-3)
 * @param {string} [options.apiKey] - Optional explicit Gemini API Key
 * @returns {Promise<Object>} Object containing recipes array and metadata
 */
export async function generateRecipes(ingredients = [], options = {}) {
  const cleanedIngredients = (Array.isArray(ingredients) ? ingredients : [ingredients])
    .map(i => (typeof i === 'string' ? i.trim() : ''))
    .filter(Boolean)

  if (cleanedIngredients.length === 0) {
    throw new Error('Please provide at least one ingredient (e.g. ["bread", "milk"]).')
  }

  const apiKey = options.apiKey || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined. Set it in .env or pass it in options.')
  }

  const ai = new GoogleGenAI({ apiKey })

  const count = Math.min(Math.max(options.count || 2, 1), 3)
  const mealType = options.mealType && options.mealType !== 'any' ? `Meal type: ${options.mealType}.` : ''
  const dietary = options.dietary && options.dietary !== 'none' ? `Dietary preference: ${options.dietary}.` : ''
  const cookingTime = options.cookingTime && options.cookingTime !== 'any' ? `Cooking time target: ${options.cookingTime}.` : ''

  const prompt = `You are an expert culinary chef and recipe developer.
Given the following provided primary ingredients:
${JSON.stringify(cleanedIngredients)}

${mealType}
${dietary}
${cookingTime}

Create ${count} creative, delicious, and realistic recipe ideas that feature these ingredients prominently.
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
      "servings": 2,
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

  let lastError = null

  // Fallback loop over candidate models
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt
      })

      const rawText = response.text || ''
      // Strip markdown code fences if present
      const cleanedJson = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim()
      const parsed = JSON.parse(cleanedJson)

      if (parsed && Array.isArray(parsed.recipes)) {
        return {
          success: true,
          modelUsed: model,
          inputIngredients: cleanedIngredients,
          recipes: parsed.recipes
        }
      }
    } catch (err) {
      lastError = err
      // If error is 503 or model unavailability, try next model
      continue
    }
  }

  throw new Error(`Failed to generate recipe with Gemini: ${lastError ? lastError.message : 'Unknown error'}`)
}

// Support running directly from CLI: `node recipe-generator.js bread milk eggs`
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const cliArgs = process.argv.slice(2)
  let input = []

  if (cliArgs.length === 0) {
    // Default example
    input = ['bread', 'milk']
    console.log('No ingredients specified. Using default demo ingredients: ["bread", "milk"]\n')
  } else if (cliArgs.length === 1 && cliArgs[0].includes(',')) {
    input = cliArgs[0].split(',').map(s => s.trim())
  } else {
    input = cliArgs
  }

  console.log(`🍳 Generating recipes for: ${input.join(', ')}...`)

  generateRecipes(input, { count: 2 })
    .then(result => {
      console.log(`\n✨ Successfully generated ${result.recipes.length} recipes using [${result.modelUsed}]:\n`)
      result.recipes.forEach((r, idx) => {
        console.log(`========================================`)
        console.log(`🍽️  #${idx + 1}: ${r.title}`)
        console.log(`    "${r.tagline}"`)
        console.log(`    ⏱️  Total: ${r.totalTime} | 👨‍🍳 Difficulty: ${r.difficulty} | 🍽️ Servings: ${r.servings}`)
        console.log(`    🏷️  Tags: ${r.dietaryTags.join(', ')}`)
        console.log(`\n    🛒 Ingredients:`)
        r.allIngredientsWithMeasurements.forEach(ing => console.log(`       • ${ing}`))
        console.log(`\n    📋 Instructions:`)
        r.instructions.forEach((step, sIdx) => console.log(`       ${sIdx + 1}. ${step}`))
        console.log(`\n    💡 Chef Tip: ${r.chefTip}`)
        console.log(`========================================\n`)
      })
    })
    .catch(err => {
      console.error('❌ Recipe generation error:', err.message)
      process.exit(1)
    })
}
