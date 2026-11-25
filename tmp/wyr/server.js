const path = require('path')
const express = require('express')

const apiRouter = require('./routes/index')

const app = express()
const publicDir = path.join(__dirname, 'public')

// Serve the client app as a web server
app.use(express.static(publicDir))

// Provide would-you-rather data as an API server
app.use('/api', apiRouter)

// Start server running (Lab 9: feedback=3000, wyr=3001, body=3002)
let server = app.listen(process.env.PORT || 3001, function () {
  console.log('Express server running on port', server.address().port)
})
