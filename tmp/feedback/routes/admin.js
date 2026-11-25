var express = require('express')
var router = express.Router()
var getAllFeedback = require('../database').getAllFeedback

router.get('/', function (req, res, next) {
  getAllFeedback()
    .then(function (feedbacks) {
      res.render('admin', {
        title: 'Admin - Feedback',
        feedbacks: feedbacks,
        hasFeedback: feedbacks.length > 0
      })
    })
    .catch(next)
})

module.exports = router
