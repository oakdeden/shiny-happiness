'use strict'

const fs = require('fs')
const path = require('path')

const links = [
  {
    variable: 'AZURE_WEBAPP_NAME_FEEDBACK',
    local: 'http://localhost:3000/feedback/',
    route: '/feedback/'
  },
  {
    variable: 'AZURE_WEBAPP_NAME_WYR',
    local: 'http://localhost:3001/wyr',
    route: '/wyr'
  },
  {
    variable: 'AZURE_WEBAPP_NAME_BMI',
    local: 'http://localhost:3002/body-index/',
    route: '/body-index/'
  }
]
const filePath = path.join(__dirname, '..', 'src', 'lab9.html')
const requiresAppNames = process.env.REQUIRE_AZURE_APP_NAMES === 'true'
let html = fs.readFileSync(filePath, 'utf8')

for (const link of links) {
  const appName = process.env[link.variable]

  if (!appName) {
    if (requiresAppNames) {
      throw new Error(`Set the GitHub Actions variable ${link.variable} before deploying.`)
    }
    continue
  }

  if (!/^[a-z0-9-]+$/i.test(appName)) {
    throw new Error(`${link.variable} must be an Azure App Service name.`)
  }

  html = html.replace(link.local, `https://${appName}.azurewebsites.net${link.route}`)
}

fs.writeFileSync(filePath, html)
