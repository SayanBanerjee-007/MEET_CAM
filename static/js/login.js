// All Global Variables ----------------------------------------------------------------
const mainContent = main.querySelector(".main-content");
const messageBox = document.getElementById("message-box");
const messageBoxBtn = document.getElementById("message-box-btn");
const email = document.getElementById("email");
const password = document.getElementById("password");
const passwordIcon = document.getElementById("password-icon");
const submitButton = document.getElementById("submit-button");
const host = location.host;
const port = location.port;
const pathname = location.pathname.substring(1);

// All Global Functions ----------------------------------------------------------------
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
    email.value.length > 4 &&
    email.value.length < 31
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
  if (isEmailValid() && isPasswordValid()) {
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

// All Event Listeners ----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  email.focus();
});
password.addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitButton.click();
});
passwordIcon.addEventListener("click", () => {
  passwordIcon.name =
    passwordIcon.name === "eye-off-outline" ? "eye-outline" : "eye-off-outline";
  password.type = password.type === "password" ? "text" : "password";
});
messageBoxBtn.addEventListener("click", () => {
  mainContent.style.overflow = "auto";
  messageBox.parentElement.classList.remove("visible");
  messageBoxBtn.style.visibility = "hidden";
});
submitButton.addEventListener("click", async (event) => {
  event.preventDefault();
  if (isValidForm()) {
    const resJSON = await fetch(`https://${host}:${port}/${pathname}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    const resValue = await resJSON.json();
    if (resJSON.status === 403) {
      location.href = `https://${host}:${port}/home`;
    } else if (resJSON.status === 500) {
      popup(
        "😢",
        "Server Error",
        "Please try again later or refresh the page."
      );
    } else if (resJSON.status === 400) {
      popup(
        "🤨",
        "Invalid Details",
        "Please check your email & password and try again."
      );
    } else if (resJSON.status === 200) {
      popup("😊", "Login Successful", "Enjoy your metting with others.", false);
      setTimeout(() => {
        location.href = `https://${host}:${port}/home`;
      }, 500);
    }
  } else {
    popup(
      "🤨",
      "Invalid Details",
      "Please check your email & password and try again."
    );
  }
});
