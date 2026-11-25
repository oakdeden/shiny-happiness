var express = require('express')
var router = express.Router()
var saveFeedback = require('../database').saveFeedback
var updateFeedbackDepartments = require('../database').updateFeedbackDepartments
var sortMessage = require('../services/message_sorter').sortMessage
var adminRouter = require('./admin')

router.use('/admin', adminRouter)

function renderForm(res, values, errors, statusCode) {
  res.status(statusCode || 200).render('index', {
    title: 'Student Feedback Form',
    name: values.name,
    email: values.email,
    studentStatus: values.studentStatus,
    studentYes: values.studentStatus === 'yes',
    studentNo: values.studentStatus === 'no',
    comments: values.comments,
    errors: errors || [],
    submitted: false
  })
}

function renderThankYou(res) {
  res.render('index', {
    title: 'Feedback Received',
    submitted: true,
    errors: []
  })
}

router.get('/', function (req, res, next) {
  renderForm(res, { name: '', email: '', studentStatus: '', comments: '' }, [])
})

router.post('/', function (req, res, next) {
  function clean(value) {
    return typeof value === 'string' ? value.trim() : ''
  }

  var values = {
    name: clean(req.body.name),
    email: clean(req.body.email),
    studentStatus: clean(req.body.studentStatus),
    comments: clean(req.body.comments)
  }
  var errors = []

  if (!values.name) errors.push('Please enter your name.')
  if (!values.email) {
    errors.push('Please enter your email address.')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.push('Please enter a valid email address.')
  }
  if (values.studentStatus !== 'yes' && values.studentStatus !== 'no') {
    errors.push('Please tell us whether you are a current student.')
  }
  if (!values.comments) errors.push('Please add your feedback.')

  if (values.name.length > 100) errors.push('Name must be 100 characters or fewer.')
  if (values.email.length > 254) errors.push('Email must be 254 characters or fewer.')
  if (values.comments.length > 5000) errors.push('Feedback must be 5000 characters or fewer.')

  if (errors.length) {
    return renderForm(res, values, errors, 400)
  }

  // 1) Database write — hard failure (user sees an error)
  saveFeedback(values)
    .then(function (feedbackId) {
      // 2) LLM sort — soft failure (feedback is already saved)
      return sortMessage(values.comments)
        .then(function (departments) {
          // 3) Database update — soft failure
          return updateFeedbackDepartments(feedbackId, departments).catch(function (err) {
            console.error('Failed to update feedback departments:', err)
          })
        })
        .catch(function (err) {
          console.error('Failed to sort feedback with Gemini:', err)
        })
        .then(function () {
          renderThankYou(res)
        })
    })
    .catch(next)
})

module.exports = router
