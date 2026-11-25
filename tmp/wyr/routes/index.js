const express = require('express')
const router = express.Router()
const randomQuestion = require('../model/index')

function sendRandomQuestion(req, res, next) {
  randomQuestion()
    .then(function (question) {
      res.set('Cache-Control', 'no-store')
      res.json(question)
    })
    .catch(next)
}

// GET random would-you-rather question as JSON (API only)
router.get('/wyr', sendRandomQuestion)

module.exports = router
