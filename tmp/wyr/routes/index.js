const express = require('express')
const router = express.Router()
const randomQuestion = require('../model/index')

// GET home page.
router.get('/wyr', function (req, res, next) {
  const questions = randomQuestion()
  res.json(questions)
})

module.exports = router
