var express = require('express')
var router = express.Router()
var getAllFeedback = require('../database').getAllFeedback

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
          studentStatus: item.studentStatus === 'yes' ? 'Yes' : 'No',
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
