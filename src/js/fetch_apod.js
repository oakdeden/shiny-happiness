const apodTitle = document.querySelector('#apod-title')
const apodExplanation = document.querySelector('#apod-explanation')
const apodImage = document.querySelector('#apod-image')
const apodVideo = document.querySelector('#apod-video')

fetch('https://science.nasa.gov/wp-json/wp/v2/apod-basic')
  .then(response => {
    if (!response.ok) {
      throw new Error(`APOD request failed: ${response.status}`)
    }
    return response.json()
  })
  .then(data => {
    const apod = Array.isArray(data) ? data[0] : data

    apodTitle.textContent = apod.title
    apodExplanation.innerHTML = apod.explanation

    if (apod.media_type === 'image') {
      apodImage.src = apod.hdurl || apod.url
      apodImage.alt = apod.alt || apod.title
      apodImage.style.display = 'block'
    } else {
      apodVideo.src = apod.url || apod.permalink
      apodVideo.style.display = 'block'
    }
  })
  .catch(error => {
    console.error(error)
    apodTitle.textContent = 'Unable to load Astronomy Picture of the Day'
  })
