var getRandomWyrQuestion = require('../../db').getRandomWyrQuestion

// Sync-looking export kept for the router; returns a Promise of a question row.
function randomQuestion() {
  return getRandomWyrQuestion()
}

module.exports = randomQuestion
