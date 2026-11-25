const path = require('path')
const express = require('express')

const indexRouter = require('./routes/index')

const app = express()
const publicDir = path.join(__dirname, 'public')

app.use(express.static(publicDir))
app.use('/would-you-rather', express.static(publicDir))

app.use('/', indexRouter)

app.get('/', function (req, res) {
  res.redirect('/would-you-rather/')
})

app.get(['/would-you-rather', '/would-you-rather/'], function (req, res) {
  res.sendFile(path.join(publicDir, 'index.html'))
})

// Start server running (Lab 9: feedback=3000, wyr=3001, body=3002)
let server = app.listen(process.env.PORT || 3001, function () {
  console.log('Express server running on port', server.address().port)
})
