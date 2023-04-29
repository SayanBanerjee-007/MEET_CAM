// All Global Variables ----------------------------------------------------------------
const body = document.getElementsByTagName('body')[0];
const messageBox = document.getElementById("message-box");
const messageBoxBtn = document.getElementById("message-box-btn");
const email = document.getElementById("email");
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
messageBoxBtn.addEventListener("click", () => {
  messageBox.parentElement.classList.remove("visible");
  messageBoxBtn.style.visibility = "hidden";
});
submitButton.addEventListener("click", async (event) => {
  event.preventDefault();
  if (isEmailValid()) {
    const resJSON = await fetch(`http://${host}:${port}/${pathname}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
      }),
    });
    const resValue = await resJSON.json();
    if (resJSON.status === 401) {
      location.href = `http://${host}:${port}/home`;
    } else if (resJSON.status === 500) {
      popup(
        "😢",
        "Server Error",
        "Please try again later or refresh the page."
      );
    } else if (resJSON.status === 400) {
      popup("🤨", "Invalid Email", "Please check your email and try again.");
    } else if (resJSON.status === 200) {
      location.href = `http://${host}:${port}/verify_otp/forget_password`;
    }
  } else {
    popup("🤨", "Invalid Email", "Please check your email and try again.");
  }
});