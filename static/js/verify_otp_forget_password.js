// All Global Variables ----------------------------------------------------------------
const body = document.getElementsByTagName('body')[0]
const messageBox = document.getElementById('message-box')
const messageBoxBtn = document.getElementById('message-box-btn')
const timeAvailable = document.getElementById('time-available')
const otpInputSection = document.querySelector('.otp-input-section')
const inputField = document.querySelectorAll('.input-field')
const submitButton = document.getElementById('submit-button')
const password = document.getElementById('password')
const passwordIcon = document.getElementById('password-icon')
const host = location.host
const port = location.port
const protocol = location.protocol
const pathname = location.pathname.substring(1)
let timeCounter = 0

// All Global Functions ----------------------------------------------------------------
function isPasswordValid() {
  const regx1 = /\s/
  if (
    !regx1.test(password.value) &&
    password.value.length > 5 &&
    password.value.length < 21
  ) {
    return true
  }
  return false
}
function getInputValue() {
  let value = ''
  Array.from(inputField).forEach(element => {
    value = `${value}${element.value}`
  })
  return value
}
function updateTime() {
  let minutes = 1,
    seconds = 59
  const intervalVar = setInterval(() => {
    if (seconds < 0 && minutes === 0) {
      clearTimeout(intervalVar)
    } else if (seconds < 0) {
      minutes -= 1
      seconds = 59
    }
    if (seconds < 10 && seconds > -1) {
      timeAvailable.innerText = `0${minutes} : 0${seconds}`
    } else if (seconds > 10) {
      timeAvailable.innerText = `0${minutes} : ${seconds} `
    }
    timeCounter++
    seconds--
  }, 1000)
}
function popup(emoji, heading, description, buttonVisibility = true) {
  messageBox.firstElementChild.innerHTML = emoji
  messageBox.children[1].innerHTML = heading
  messageBox.children[2].innerHTML = description
  if (!buttonVisibility) {
    messageBoxBtn.style.visibility = 'hidden'
  } else {
    messageBoxBtn.style.visibility = 'visible'
  }
  messageBox.parentElement.classList.add('visible')
}

// All Event Listeners ----------------------------------------------------------------
window.onload = () => {
  updateTime()
  otpInputSection.firstElementChild.focus()
}
Array.from(inputField).forEach(inputElement => {
  inputElement.addEventListener('keyup', event => {
    if (event.keyCode === 16) {
      return
    }
    if (inputElement.value === ' ') {
      inputElement.value = ''
    }
    if (
      inputElement.value !== '' &&
      inputElement.dataset.position !== '6'
    ) {
      inputField[inputElement.dataset.position].focus()
    } else if (
      inputField[inputElement.dataset.position - 1].value === '' &&
      inputElement.dataset.position !== '1'
    ) {
      inputField[inputElement.dataset.position - 2].focus()
    }
  })
})
otpInputSection.lastElementChild.addEventListener('keyup', event => {
  if (event.key === 'Enter') submitButton.click()
})
passwordIcon.addEventListener('click', () => {
  passwordIcon.name =
    passwordIcon.name === 'eye-off-outline'
      ? 'eye-outline'
      : 'eye-off-outline'
  password.type = password.type === 'password' ? 'text' : 'password'
})
messageBoxBtn.addEventListener('click', () => {
  messageBox.parentElement.classList.remove('visible')
  messageBoxBtn.style.visibility = 'hidden'
})
submitButton.addEventListener('click', async event => {
  event.preventDefault()
  const otp = getInputValue()
  // if (document.cookie === '') {
  //   popup(
  //     '😅',
  //     'Session Expired',
  //     'Please try again or contact with developer.',
  //     false
  //   )
  //   setTimeout(() => {
  //     location.href = `${protocol}//${host}:${port}/forget_password`
  //   }, 2000)
  //   return
  // }

  if (otp.length === 6 && isPasswordValid()) {
    const resJSON = await fetch(
      `${protocol}//${host}:${port}/${pathname}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: password.value,
          otp,
        }),
      }
    )
    if (resJSON.status === 400) {
      location.href = `${protocol}//${host}:${port}/login`
    } else if (resJSON.status === 500) {
      popup(
        '😢',
        'Server Error',
        'Please try again later or refresh the page.'
      )
    } else if (resJSON.status === 401) {
      popup('🤨', 'Wrong OTP', 'Please check your OTP and try again.')
    } else if (resJSON.status === 410) {
      popup(
        '🤨',
        'OTP Expired',
        'Please click on Resend OTP and try again.'
      )
    } else if (resJSON.status === 200) {
      popup(
        '😊',
        'Changing Successful',
        'Your password has been changed successfully.',
        false
      )
      setTimeout(() => {
        location.href = `${protocol}//${host}:${port}/login`
      }, 1500)
    }
  } else {
    if (timeCounter > 120) {
      popup(
        '🤨',
        'Time Expired',
        'Please click on Resend OTP and try again.'
      )
    } else {
      popup(
        '🤨',
        'Invalid Details',
        'Please check the details and try again.'
      )
    }
  }
})
