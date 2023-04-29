// All Global Variables ----------------------------------------------------------------
const mainContent = main.querySelector(".main-content");
const messageBox = document.getElementById("message-box");
const messageBoxBtn = document.getElementById("message-box-btn");
const name = document.getElementById("name");
const phoneNumber = document.getElementById("phone-number");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const submitButton = document.getElementById("submit-button");
const host = location.host;
const port = location.port;
const pathname = location.pathname.substring(1);

// All Global Functions ----------------------------------------------------------------
function isNameValid() {
  const regx1 = /([A-Za-z])/;
  const regx2 = /^\s/;
  const regx3 = /\s$/;
  const regx4 = /\s{2,}/;
  if (
    regx1.test(name.value) &&
    !regx2.test(name.value) &&
    !regx3.test(name.value) &&
    !regx4.test(name.value) &&
    name.value.length > 4 &&
    name.value.length < 31
  ) {
    return true;
  }
  return false;
}
function isPhoneNumberValid() {
  const regx1 = /^[0-9][0-9]{8}[0-9]$/;
  if (
    regx1.test(Number(phoneNumber.value)) &&
    phoneNumber.value.length === 10
  ) {
    return true;
  }
  return false;
}
function isEmailValid() {
  const regx1 = /^\w[A-Za-z0-9_.]{2,}@[A-Za-z]{2,10}\.[a-z]{2,7}$/;
  const regx2 = /^\..*\.{2,}/;
  const regx3 = /^_.*_{2,}/;
  const regx4 = /(_@)/;
  const regx5 = /(\.@)/;
  if (
    regx1.test(email.value) &&
    !regx2.test(email.value) &&
    !regx3.test(email.value) &&
    !regx4.test(email.value) &&
    !regx5.test(email.value) &&
    email.value.length > 6 &&
    email.value.length < 51
  ) {
    return true;
  }
  return false;
}
function isPasswordValid() {
  const regx1 = /\s/;
  if (
    !regx1.test(password.value) &&
    password.value.length > 5 &&
    password.value.length < 21
  ) {
    return true;
  }
  return false;
}
function isValidForm() {
  if (
    isNameValid() &&
    isPhoneNumberValid() &&
    isEmailValid() &&
    isPasswordValid() &&
    password.value === confirmPassword.value
  ) {
    return true;
  }
  return false;
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
  mainContent.style.overflow = "hidden";
  messageBox.parentElement.classList.add("visible");
}
function emptyInput() {
  name.value = "";
  phoneNumber.value = "";
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
}

// All Event Listeners ----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  name.focus();
});
confirmPassword.addEventListener("input", () => {
  if (
    confirmPassword.value !==
    password.value.slice(0, confirmPassword.value.length)
  ) {
    confirmPassword.style.color = "red";
  } else {
    confirmPassword.style.color = "black";
  }
});
password.addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitButton.click();
});
messageBoxBtn.addEventListener("click", () => {
  mainContent.style.overflow = "auto";
  messageBox.parentElement.classList.remove("visible");
  messageBoxBtn.style.visibility = "hidden";
});
submitButton.addEventListener("click", async (event) => {
  event.preventDefault();
  if (isValidForm()) {
    const resJSON = await fetch(`http://${host}:${port}/${pathname}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        phoneNumber: phoneNumber.value,
        password: password.value,
      }),
    });
    const resValue = await resJSON.json();
    if (resJSON.status === 403) {
      location.href = `http://${host}:${port}/home`;
    } else if (resJSON.status === 500) {
      popup(
        "😢",
        "Server Error",
        "Please try again later or refresh the page."
      );
    } else if (resJSON.status === 400) {
      popup(
        "😢",
        "Email Reserved",
        "Please try again with a different email address."
      );
    } else if (resJSON.status === 200) {
      emptyInput();
      popup(
        "😊",
        "Signup Successful",
        "Enjoy your metting with others.",
        false
      );
      setTimeout(() => {
        location.href = `http://${host}:${port}/login`;
      }, 500);
    }
  } else {
    popup(
      "🤨",
      "Invalid Details",
      "Please check your details carefully and signup."
    );
  }
});
