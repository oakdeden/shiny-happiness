const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')

// import the routes in routes/index.js
const indexRouter = require('./routes/index')

// Create the web application
const app = express()

// enable parsing of POST request form body
app.use(bodyParser.urlencoded({ extended: false }))

// serve static files, such as CSS
const staticFileLocation = path.join(__dirname, 'public')
app.use(express.static(staticFileLocation))

// configure it to use the Handlebars template engine and
// work with template files in the views directory
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// make the routes in index.js available to the app
app.use('/', indexRouter)

// Start server running
let server = app.listen(process.env.PORT || 3000, function () {
  console.log('Express server running on port', server.address().port)
})
