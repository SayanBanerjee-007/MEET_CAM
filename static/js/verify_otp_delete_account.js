// All Global Variables ----------------------------------------------------------------
const body = document.getElementsByTagName("body")[0];
const messageBox = document.getElementById("message-box");
const messageBoxBtn = document.getElementById("message-box-btn");
const timeAvailable = document.getElementById("time-available");
const otpInputSection = document.querySelector(".otp-input-section");
const inputField = document.querySelectorAll(".input-field");
const submitButton = document.getElementById("submit-button");
const host = location.host;
const port = location.port;
const pathname = location.pathname.substring(1);
let timeCounter = 0;

// All Global Functions ----------------------------------------------------------------
function getInputValue() {
  let value = "";
  Array.from(inputField).forEach((element) => {
    value = `${value}${element.value}`;
  });
  return value;
}
function updateTime() {
  let minutes = 1,
    seconds = 59;
  const intervalVar = setInterval(() => {
    if (seconds < 0 && minutes === 0) {
      clearTimeout(intervalVar);
    } else if (seconds < 0) {
      minutes -= 1;
      seconds = 59;
    }
    if (seconds < 10 && seconds > -1) {
      timeAvailable.innerText = `0${minutes} : 0${seconds}`;
    } else if (seconds > 10) {
      timeAvailable.innerText = `0${minutes} : ${seconds} `;
    }
    timeCounter++;
    seconds--;
  }, 1000);
}
function popup(emoji, heading, description, buttonVisibility = true) {
  messageBox.firstElementChild.innerHTML = emoji;
  messageBox.children[1].innerHTML = heading;
  messageBox.children[2].innerHTML = description;
  if (!buttonVisibility) {
    messageBoxBtn.style.visibility = "hidden";
  } else {
    messageBoxBtn.style.visibility = "visible";
  }
  messageBox.parentElement.classList.add("visible");
}

// All Event Listeners ----------------------------------------------------------------
window.onload = () => {
  updateTime();
  otpInputSection.firstElementChild.focus();
};
Array.from(inputField).forEach((inputElement) => {
  inputElement.addEventListener("keyup", (event) => {
    if (event.keyCode === 16) {
      return;
    }
    if (inputElement.value === " ") {
      inputElement.value = "";
    }
    if (inputElement.value !== "" && inputElement.dataset.position !== "6") {
      inputField[inputElement.dataset.position].focus();
    } else if (
      inputField[inputElement.dataset.position - 1].value === "" &&
      inputElement.dataset.position !== "1"
    ) {
      inputField[inputElement.dataset.position - 2].focus();
    }
  });
});
otpInputSection.lastElementChild.addEventListener("keyup", (event) => {
  if (event.key === "Enter") submitButton.click();
});
messageBoxBtn.addEventListener("click", () => {
  messageBox.parentElement.classList.remove("visible");
  messageBoxBtn.style.visibility = "hidden";
});
submitButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const otp = getInputValue();

  if (otp.length === 6) {
    const resJSON = await fetch(`http://${host}:${port}/${pathname}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    });
    if (resJSON.status === 401) {
      location.href = `http://${host}:${port}/home`;
    } else if (resJSON.status === 500) {
      popup(
        "😢",
        "Server Error",
        "Please try again later or refresh the page."
      );
    } else if (resJSON.status === 400) {
      popup("🤨", "Wrong OTP", "Please check your OTP and try again.");
    } else if (resJSON.status === 200) {
      popup(
        "😭",
        "Account Deleted",
        "Your account has been deleted successfully.",
        false
      );
      setTimeout(() => {
        location.href = `http://${host}:${port}/home`;
      }, 3000);
    }
  } else {
    if (timeCounter > 120) {
      popup("🤨", "Time Expired", "Please click on Resend OTP and try again.");
    } else {
      popup("🤨", "Wrong OTP", "Please check your OTP and try again.");
    }
  }
});
