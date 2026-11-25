var path = require('path')
var { GoogleGenAI, Type } = require('@google/genai')
var departments = require('./departments.json')

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile()
  } catch (_) {
    try {
      process.loadEnvFile(path.resolve(__dirname, '../../../.env'))
    } catch (_) {
      // Ignore if no .env is available.
    }
  }
}

/**
 * Sort a feedback message into matching department names via Gemini.
 * Returns an empty array when nothing is a good fit.
 *
 * @param {string} message
 * @returns {Promise<string[]>}
 */
async function sortMessage(message) {
  var apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please check your .env file.')
  }

  var ai = new GoogleGenAI({ apiKey })
  var prompt =
    'You route student feedback to the correct college departments.\n' +
    'Choose only from this department list (name and description):\n' +
    JSON.stringify(departments, null, 2) +
    '\n\nStudent feedback:\n' +
    message +
    '\n\nReturn an array of department names that are a good fit for this feedback. ' +
    'If there is no good fit, return an empty list.'

  var response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: 'A department name from the provided list'
        }
      }
    }
  })

  var parsed = JSON.parse(response.text || '[]')
  return Array.isArray(parsed) ? parsed : []
}

module.exports = {
  sortMessage: sortMessage
}
