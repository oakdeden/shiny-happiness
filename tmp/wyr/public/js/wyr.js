;(function () {
  var questionEl = document.getElementById('question')
  var answer1Btn = document.getElementById('answer1')
  var answer2Btn = document.getElementById('answer2')
  var statusEl = document.getElementById('status')
  var nextBtn = document.getElementById('next-question')

  function setStatus(message, isError) {
    statusEl.textContent = message || ''
    statusEl.classList.toggle('is-error', Boolean(isError))
  }

  function clearSelection() {
    answer1Btn.classList.remove('is-selected')
    answer2Btn.classList.remove('is-selected')
  }

  function showQuestion(data) {
    questionEl.textContent = data.question
    answer1Btn.textContent = data.answer1
    answer2Btn.textContent = data.answer2
    clearSelection()
    setStatus('')
  }

  function loadQuestion() {
    setStatus('Loading a question…')
    nextBtn.disabled = true
    answer1Btn.disabled = true
    answer2Btn.disabled = true

    return fetch('/api/wyr', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Could not load a question (' + response.status + ').')
        }
        return response.json()
      })
      .then(function (data) {
        if (!data || !data.question || !data.answer1 || !data.answer2) {
          throw new Error('The API returned an unexpected response.')
        }
        showQuestion(data)
      })
      .catch(function (err) {
        questionEl.textContent = 'Unable to load a question right now.'
        answer1Btn.textContent = '—'
        answer2Btn.textContent = '—'
        setStatus(err.message || 'Something went wrong.', true)
      })
      .then(function () {
        nextBtn.disabled = false
        answer1Btn.disabled = false
        answer2Btn.disabled = false
      })
  }

  answer1Btn.addEventListener('click', function () {
    clearSelection()
    answer1Btn.classList.add('is-selected')
    setStatus('You picked: ' + answer1Btn.textContent)
  })

  answer2Btn.addEventListener('click', function () {
    clearSelection()
    answer2Btn.classList.add('is-selected')
    setStatus('You picked: ' + answer2Btn.textContent)
  })

  nextBtn.addEventListener('click', function () {
    loadQuestion()
  })

  loadQuestion()
})()
