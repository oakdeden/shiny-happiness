# 🍳 AI Recipe Generator (PantryGen)

A standalone culinary application powered by **Google Gemini** that invents creative, delicious, and foolproof recipes from an array of pantry ingredients (e.g. `['bread', 'milk']`).

---

## 🚀 Features

- **Gemini AI Engine**: Utilizes Google's fast and creative `gemini-3.5-flash` model with automatic fallback resiliency.
- **Dual Interface**:
  - **Modern Web App**: Dark culinary glassmorphism design, interactive tag inputs, quick pantry presets, dietary & cook-time filters, interactive ingredient checklists, and a saved favorites bookmark system.
  - **CLI & Module**: Run recipes directly from your terminal or import `generateRecipes()` into any JavaScript/Node.js script.
- **Zero-Dependency Server**: Built using native Node.js HTTP with built-in API routing and static file delivery.

---

## 🛠️ Quick Start

### 1. Configure Gemini API Key
Make sure your API key is defined in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 2. Run the Web Application
```bash
cd recipe-generator
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 💻 CLI Usage

You can generate recipes directly from the command line:

```bash
# Example with bread and milk
node recipe-generator.js bread milk

# Example with multiple comma-separated ingredients
node recipe-generator.js "bread, milk, eggs, cinnamon, honey"
```

---

## 📦 Programmatic Usage

Import `generateRecipes` into any Node.js module:

```javascript
import { generateRecipes } from './recipe-generator.js'

const ingredients = ['bread', 'milk']
const options = {
  mealType: 'breakfast',       // 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'any'
  dietary: 'vegetarian',        // 'vegetarian' | 'vegan' | 'comfort food' | 'none'
  cookingTime: 'under 15 mins', // 'under 15 mins' | 'under 30 mins' | 'any'
  count: 2
}

const result = await generateRecipes(ingredients, options)
console.log(result.recipes)
```

---

## 📁 Project Structure

```
recipe-generator/
├── .env                  # API Key configuration
├── package.json          # Subproject metadata & scripts
├── recipe-generator.js   # Gemini core library & CLI runner
├── server.js             # Native Node HTTP server & API endpoint
├── README.md             # Subproject documentation
└── public/               # Frontend client app
    ├── index.html        # Modern semantic HTML5 interface
    ├── styles.css        # Vanilla CSS with glassmorphic tokens & animations
    ├── app.js            # Reactive tag management & API client
    └── assets/
        └── hero.jpg      # Gourmet culinary hero image
```
