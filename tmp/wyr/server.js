const express = require('express')

// import the routes in routes/index.js
const indexRouter = require('./routes/index')

// Create the web application
const app = express()

// make the routes in index.js available to the app
app.use('/', indexRouter)

app.get('/', function (req, res) {
  res.redirect('/wyr')
})

// Start server running (Lab 9: feedback=3000, wyr=3001, body=3002)
let server = app.listen(process.env.PORT || 3001, function () {
  console.log('Express server running on port', server.address().port)
})
