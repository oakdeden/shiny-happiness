var createError = require('http-errors')
var express = require('express')
var router = express.Router()

var questions = [
  {
    id: '1',
    prompt: 'Would you rather be able to fly or be invisible?',
    options: { A: 'Fly', B: 'Be invisible' },
    votes: { A: 0, B: 0 }
  },
  {
    id: '2',
    prompt: 'Would you rather explore the deep ocean or outer space?',
    options: { A: 'Explore the deep ocean', B: 'Explore outer space' },
    votes: { A: 0, B: 0 }
  },
  {
    id: '3',
    prompt: 'Would you rather always arrive 10 minutes late or 20 minutes early?',
    options: { A: 'Arrive 10 minutes late', B: 'Arrive 20 minutes early' },
    votes: { A: 0, B: 0 }
  }
]

function serializeQuestion(question) {
  return {
    id: question.id,
    prompt: question.prompt,
    options: question.options,
    votes: question.votes,
    totalVotes: question.votes.A + question.votes.B
  }
}

function findQuestion(id) {
  return questions.find(function (question) {
    return question.id === id
  })
}

router.get('/', function (req, res) {
  res.json({
    name: 'Would You Rather API',
    endpoints: {
      questions: 'GET /would-you-rather/questions',
      question: 'GET /would-you-rather/questions/:id',
      vote: 'POST /would-you-rather/questions/:id/votes with JSON body { "choice": "A" | "B" }'
    }
  })
})

router.get('/questions', function (req, res) {
  res.json({ data: questions.map(serializeQuestion) })
})

router.get('/questions/:id', function (req, res, next) {
  var question = findQuestion(req.params.id)
  if (!question) return next(createError(404, 'Question not found'))

  res.json({ data: serializeQuestion(question) })
})

router.post('/questions/:id/votes', function (req, res, next) {
  var question = findQuestion(req.params.id)
  if (!question) return next(createError(404, 'Question not found'))

  var choice = req.body && req.body.choice
  if (choice !== 'A' && choice !== 'B') {
    return next(createError(400, 'choice must be either A or B'))
  }

  question.votes[choice] += 1
  res.status(201).json({ data: serializeQuestion(question) })
})

module.exports = router
