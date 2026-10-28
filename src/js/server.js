import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateRecipes } from './recipe-generator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SRC_DIR = path.resolve(__dirname, '..')
const PORT = process.env.PORT || 3003
const STATIC_FILES = new Map([
  ['/', path.join(SRC_DIR, 'generator.html')],
  ['/generator.css', path.join(SRC_DIR, 'generator.css')],
  ['/js/app.js', path.join(__dirname, 'app.js')],
  ['/assets/hero.jpg', path.join(SRC_DIR, 'assets', 'hero.jpg')]
])

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

  // API Endpoint: /api/generate-recipe
  if (req.method === 'POST' && url.pathname === '/api/generate-recipe') {
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > 1e6) {
        req.socket.destroy() // Limit payload to 1MB
      }
    })

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}')
        const { ingredients, options } = payload

        if (!ingredients || (Array.isArray(ingredients) && ingredients.length === 0)) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Ingredients array is required.' }))
          return
        }

        const result = await generateRecipes(ingredients, options || {})
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
      } catch (err) {
        console.error('API Error:', err.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message || 'Internal server error' }))
      }
    })
    return
  }

  // Health check endpoint
  if (req.method === 'GET' && url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }))
    return
  }

  // Serve only the frontend files used by the generator.
  const filePath = STATIC_FILES.get(url.pathname)
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found')
    return
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    res.writeHead(200, { 'Content-Type': contentType })
    fs.createReadStream(filePath).pipe(res)
  })
})

server.listen(PORT, () => {
  console.log(`\n🍳 Recipe Generator Server running at: http://localhost:${PORT}`)
  console.log(`📡 Ready to generate AI recipes from ingredient arrays!\n`)
})
