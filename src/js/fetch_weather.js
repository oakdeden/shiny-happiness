const weatherTable = document.querySelector('#weather-forecast')

fetch('https://api.weather.gov/points/44.98,-93.27')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Weather points request failed: ${response.status}`)
    }
    return response.json()
  })
  .then(pointsData => {
    const forecastUrl = pointsData.properties.forecast
    return fetch(forecastUrl)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Weather forecast request failed: ${response.status}`)
    }
    return response.json()
  })
  .then(forecastData => {
    const periods = forecastData.properties.periods

    periods.forEach(period => {
      const row = document.createElement('tr')

      const dayCell = document.createElement('td')
      dayCell.textContent = period.name
      row.appendChild(dayCell)

      const temperatureCell = document.createElement('td')
      temperatureCell.textContent = `${period.temperature}°${period.temperatureUnit}`
      row.appendChild(temperatureCell)

      const iconCell = document.createElement('td')
      const iconImage = document.createElement('img')
      iconImage.src = period.icon
      iconImage.alt = period.shortForecast
      iconCell.appendChild(iconImage)
      row.appendChild(iconCell)

      const detailedForecastCell = document.createElement('td')
      detailedForecastCell.textContent = period.detailedForecast
      row.appendChild(detailedForecastCell)

      const windSpeedCell = document.createElement('td')
      windSpeedCell.textContent = period.windSpeed
      row.appendChild(windSpeedCell)

      const windDirectionCell = document.createElement('td')
      windDirectionCell.textContent = period.windDirection
      row.appendChild(windDirectionCell)

      weatherTable.appendChild(row)
    })
  })
  .catch(error => {
    console.error(error)
    const row = document.createElement('tr')
    const cell = document.createElement('td')
    cell.colSpan = 6
    cell.textContent = 'Unable to load weather forecast'
    row.appendChild(cell)
    weatherTable.appendChild(row)
  })
