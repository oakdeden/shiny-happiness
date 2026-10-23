const questions = [
  {
    question: 'Explore the ocean floor or explore outer space?',
    answer1: 'Explore the ocean floor',
    answer2: 'Explore outer space'
  },
  {
    question: 'Always have perfect weather for picnics or perfect weather for stargazing?',
    answer1: 'Perfect picnic weather',
    answer2: 'Perfect stargazing weather'
  },
  {
    question: 'Travel anywhere by train or anywhere by hot-air balloon?',
    answer1: 'Travel by train',
    answer2: 'Travel by hot-air balloon'
  },
  {
    question: 'Have a tiny robot assistant or a talking pet?',
    answer1: 'Tiny robot assistant',
    answer2: 'Talking pet'
  },
  {
    question: 'Visit the past for one day or visit the future for one day?',
    answer1: 'Visit the past',
    answer2: 'Visit the future'
  }
]

function randomQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length)
  const randomQuestion = questions[randomIndex]
  return randomQuestion
}

module.exports = randomQuestion
