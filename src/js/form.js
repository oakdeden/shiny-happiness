function initTreeOrderForm() {
    console.log("Script loaded successfully");
  const homeownerNameInput = document.querySelector('#homeowner-name')
  const homeownerHouseNumberInput = document.querySelector('#homeowner-house-number')
  const homeownerStreetNameInput = document.querySelector('#homeowner-street-name')
  const cityInput = document.querySelector('#city')
  const zipCodeInput = document.querySelector('#zipcode')
  const treeTypeSelect = document.querySelector('#tree-type')
  const submitButton = document.querySelector('#submit-order')
  const orderSummaryParagraph = document.querySelector('#order-summary')

  // Exit early if elements are missing from the page
  if (!submitButton || !orderSummaryParagraph) {
    return
  }

  function isValidMinnesotaZip(zip) {
    if (!/^\d{5}$/.test(zip)) {
      return false
    }
    const numericZip = Number(zip)
    return numericZip >= 55001 && numericZip <= 56763
  }

  submitButton.addEventListener('click', function (event) {
    event.preventDefault()

    const name = homeownerNameInput.value.trim()
    const houseNumber = homeownerHouseNumberInput.value.trim()
    const streetName = homeownerStreetNameInput.value.trim()
    const city = cityInput.value.trim()
    const zipCode = zipCodeInput.value.trim()
    const treeType = treeTypeSelect.value

    const errors = []
    const formElements = [
      homeownerNameInput,
      homeownerHouseNumberInput,
      homeownerStreetNameInput,
      cityInput,
      zipCodeInput,
      treeTypeSelect
    ]

    // Reset error styles
    formElements.forEach(element => element.classList.remove('error'))

    // Validate required fields
    if (!name) {
      errors.push('Homeowner Name is required.')
      homeownerNameInput.classList.add('error')
    }

    if (!houseNumber) {
      errors.push('House Number is required.')
      homeownerHouseNumberInput.classList.add('error')
    }

    if (!streetName) {
      errors.push('Street Name is required.')
      homeownerStreetNameInput.classList.add('error')
    }

    if (!city) {
      errors.push('City is required.')
      cityInput.classList.add('error')
    }

    if (!treeType) {
      errors.push('Please select a Tree Type.')
      treeTypeSelect.classList.add('error')
    }

    // Validate Minnesota Zip Code
    if (!zipCode) {
      errors.push('Zip Code is required.')
      zipCodeInput.classList.add('error')
    } else if (!isValidMinnesotaZip(zipCode)) {
      errors.push('Zip Code must be a 5-digit number between 55001 and 56763.')
      zipCodeInput.classList.add('error')
    }

    // Display errors or output the valid summary
    if (errors.length > 0) {
      alert(errors.join('\n'))
      orderSummaryParagraph.innerHTML = ''
      return
    }

    const orderSummary = `Name: ${name}<br>House Number: ${houseNumber}<br>Street Name: ${streetName}<br>City: ${city}<br>Zip Code: ${zipCode}<br>Tree Type: ${treeType}`
    orderSummaryParagraph.innerHTML = orderSummary
  })
}

// Automatically initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initTreeOrderForm)