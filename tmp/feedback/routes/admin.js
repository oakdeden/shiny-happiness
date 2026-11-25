var express = require('express')
var router = express.Router()
var getAllFeedback = require('../database').getAllFeedback

function formatStudentStatus(raw) {
  var value = raw
  if (Buffer.isBuffer(raw)) value = raw.toString('utf8')
  if (typeof value === 'string') value = value.trim().toLowerCase()

  if (value === 'yes' || value === 'y' || value === '1' || value === 1 || value === true) {
    return 'Yes'
  }
  if (value === 'no' || value === 'n' || value === '0' || value === 0 || value === false) {
    return 'No'
  }
  return value ? String(value) : '—'
}

function formatDepartments(raw) {
  if (!raw) return 'None'
  var list = raw
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw)
    } catch (_) {
      return raw.trim() || 'None'
    }
  }
  if (!Array.isArray(list) || list.length === 0) return 'None'
  return list.join(', ')
}

router.get('/', function (req, res, next) {
  getAllFeedback()
    .then(function (feedbacks) {
      var rows = feedbacks.map(function (item) {
        return {
          name: item.name,
          email: item.email,
          studentStatus: formatStudentStatus(item.studentStatus),
          comments: item.comments,
          departments: formatDepartments(item.departments),
          createdAt: item.createdAt
        }
      })

      res.render('admin', {
        title: 'Admin - Feedback',
        feedbacks: rows,
        hasFeedback: rows.length > 0
      })
    })
    .catch(next)
})

module.exports = router
