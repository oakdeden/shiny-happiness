import { GoogleGenAI } from '@google/genai'

// Initialize the Gemini SDK using the API key injected via Webpack
const apiKey = process.env.GEMINI_API_KEY || ''
const ai = new GoogleGenAI({ apiKey })

/**
 * Generate text content using Gemini
 * @param {string} prompt
 * @param {string} [model='gemini-3.8-flash']
 * @returns {Promise<string>}
 */
export async function askGemini(prompt, model = 'gemini-3.8-flash') {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please check your .env file.')
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  })

  return response.text
}

export { ai }
