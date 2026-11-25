const questions = [
  {
    question: 'Be able to speak every language or play every instrument?',
    answer1: 'Speak every language',
    answer2: 'Play every instrument'
  },
  {
    question: 'Have unlimited concert tickets or unlimited plane tickets?',
    answer1: 'Unlimited concert tickets',
    answer2: 'Unlimited plane tickets'
  },
  {
    question: 'Live in a cabin in the woods or a loft in a busy city?',
    answer1: 'Cabin in the woods',
    answer2: 'Loft in a busy city'
  },
  {
    question: 'Never have to sleep or never have to eat?',
    answer1: 'Never have to sleep',
    answer2: 'Never have to eat'
  },
  {
    question: 'Only read fiction for a year or only read nonfiction for a year?',
    answer1: 'Only fiction',
    answer2: 'Only nonfiction'
  }
]
// Function to get a random question from the array
function randomQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length)
  const randomQuestion = questions[randomIndex]
  return randomQuestion
}
// Export the randomQuestion function for use in other files
module.exports = randomQuestion
