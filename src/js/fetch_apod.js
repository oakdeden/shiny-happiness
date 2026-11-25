const apodTitle = document.querySelector('#apod-title')
const apodExplanation = document.querySelector('#apod-explanation')
const apodImage = document.querySelector('#apod-image')
const apodVideo = document.querySelector('#apod-video')

fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
  .then(response => {
    if (!response.ok) {
      throw new Error(`APOD request failed: ${response.status}`)
    }
    return response.json()
  })
  .then(data => {
    apodTitle.textContent = data.title
    apodExplanation.textContent = data.explanation

    if (data.media_type === 'image') {
      apodImage.src = data.url
      apodImage.alt = data.title
      apodImage.style.display = 'block'
    } else {
      apodVideo.src = data.url
      apodVideo.style.display = 'block'
    }
  })
  .catch(error => {
    console.error(error)
    apodTitle.textContent = 'Unable to load Astronomy Picture of the Day'
  })
