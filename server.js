var path = require('path')
var createError = require('http-errors')
var express = require('express')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var expressHandlebars = require('express-handlebars')

var db = require('./tmp/db')
var feedbackRouter = require('./tmp/feedback/routes')
var wyrRouter = require('./tmp/wyr/routes')
var bodyRouter = require('./tmp/body/routes')

var app = express()
var distDir = path.join(__dirname, 'dist')
var port = normalizePort(process.env.PORT || '3000')

function createLabApp(options) {
  var lab = express()

  lab.set('views', options.views)
  lab.engine(
    'hbs',
    expressHandlebars.engine({
      extname: '.hbs',
      defaultLayout: options.defaultLayout,
      layoutsDir: options.views,
      partialsDir: options.partialsDir || path.join(options.views, 'partials')
    })
  )
  lab.set('view engine', 'hbs')
  lab.use(express.json())
  lab.use(express.urlencoded({ extended: false }))
  lab.use(cookieParser())

  if (options.publicDir) {
    lab.use(express.static(options.publicDir))
  }

  lab.use(options.router)
  return lab
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(
  '/feedback',
  createLabApp({
    views: path.join(__dirname, 'tmp/feedback/views'),
    defaultLayout: 'layout',
    publicDir: path.join(__dirname, 'tmp/feedback/public'),
    router: feedbackRouter
  })
)

app.use(
  '/body-index',
  createLabApp({
    views: path.join(__dirname, 'tmp/body/views'),
    defaultLayout: 'Layout',
    publicDir: path.join(__dirname, 'tmp/body/public'),
    router: bodyRouter
  })
)

app.use(express.static(distDir))

// API routes after static so they do not steal the site homepage
app.use(wyrRouter)

app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.type('text').send(err.message || 'Server error')
})

function normalizePort(val) {
  var parsed = parseInt(val, 10)
  if (isNaN(parsed)) return val
  if (parsed >= 0) return parsed
  return false
}

db.ready
  .then(function () {
    app.listen(port, function () {
      console.log('ITEC site listening on port', port)
      console.log('SQLite database:', db.databasePath)
    })
  })
  .catch(function (error) {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  })
