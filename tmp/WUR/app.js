var createError = require('http-errors')
var express = require('express')

var indexRouter = require('./routes/index')

var app = express()

app.use(express.json())

app.use('/would-you-rather', indexRouter)

app.use(function (req, res, next) {
  next(createError(404, 'API route not found'))
})

app.use(function (err, req, res, next) {
  if (res.headersSent) return next(err)
  var status = err.status || 500
  res.status(status).json({
    error: status < 500 ? err.message : 'Internal server error'
  })
})

module.exports = app
