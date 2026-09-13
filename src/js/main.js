// Import our custom CSS
import '../scss/styles.scss'

// Import only the Bootstrap components we need
import { Popover } from 'bootstrap'

// Create an example popover
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(popover => {
  new Popover(popover)
})

// Go back to the previous page (available to inline onclick handlers)
window.goBack = function goBack() {
  if (window.history.length > 1) {
    history.back();
  } else {
    window.location.href = 'index.html';
  }
};


// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()