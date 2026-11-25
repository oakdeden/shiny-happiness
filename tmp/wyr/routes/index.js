const express = require('express')
const router = express.Router()
const randomQuestion = require('../model/index')

function sendRandomQuestion(req, res) {
  res.set('Cache-Control', 'no-store')
  res.json(randomQuestion())
}

// GET random would-you-rather question as JSON
router.get('/wyr', sendRandomQuestion)
router.get(['/would-you-rather', '/would-you-rather/'], sendRandomQuestion)
router.get('/', sendRandomQuestion)

module.exports = router
