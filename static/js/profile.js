// All Global Variables ----------------------------------------------------------------
const mainContent = main.querySelector(".main-content");
const messageBox = document.getElementById("message-box");
const messageBoxBtn = document.getElementById("message-box-btn");
const myProfileImage = document.getElementById("my-profile-image");
const imageInput = document.getElementById("image-input");
const imageInputLabel = document.getElementById("image-input-label");
const imageSaveButton = document.getElementById("image-save-button");
const removeImageButtonClient = document.getElementById(
  "remove-image-button-client"
);
const removeImageButtonServer = document.getElementById(
  "remove-image-button-server"
);
const changePasswordButton = document.getElementById("change-password-button");
const oldPassword = document.getElementById("old-password");
const newPassword = document.getElementById("new-password");
const passwordIcon = document.getElementById("password-icon");
const changePasswordSubmitButton = document.getElementById(
  "change-password-submit-button"
);
const host = location.host;
const port = location.port;
const pathname = location.pathname.substring(1);

// All Global Functions ----------------------------------------------------------------
function isPasswordValid(password) {
  const regx1 = /\s/;
  if (!regx1.test(password) && password.length > 5 && password.length < 21) {
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
changePasswordButton.addEventListener("click", () => {
  document.querySelector(".change-password").classList.toggle("visible");
  mainContent.scrollTop = mainContent.scrollHeight;
});
passwordIcon.addEventListener("click", () => {
  passwordIcon.name =
    passwordIcon.name === "eye-off-outline" ? "eye-outline" : "eye-off-outline";
  newPassword.type = newPassword.type === "password" ? "text" : "password";
});
messageBoxBtn.addEventListener("click", () => {
  mainContent.style.overflow = "auto";
  messageBox.parentElement.classList.remove("visible");
  messageBoxBtn.style.visibility = "hidden";
});
imageInput?.addEventListener("change", () => {
  const file = imageInput.files["0"];
  if (
    file &&
    (file?.type === "image/jpeg" ||
      file?.type === "image/JPEG" ||
      file?.type === "image/PNG" ||
      file?.type === "image/png" ||
      file?.type === "image/JPG" ||
      file?.type === "image/jpg")
  ) {
    myProfileImage.src = URL.createObjectURL(file);
    document.querySelector(".image-icon").classList.add("invisible");
    myProfileImage.parentElement.classList.add("visible");
    imageInputLabel.classList.add("invisible");
    imageSaveButton.classList.add("visible");
    removeImageButtonClient.classList.add("visible");
  } else {
    alert("Only JPEG / JPG / PNG images are supported.");
  }
});
removeImageButtonClient?.addEventListener("click", () => {
  imageInput.value = "";
  document.querySelector(".image-icon").classList.remove("invisible");
  myProfileImage.parentElement.classList.remove("visible");
  imageInputLabel.classList.remove("invisible");
  imageSaveButton.classList.remove("visible");
  removeImageButtonClient.classList.remove("visible");
});
removeImageButtonServer?.addEventListener("click", async () => {
  const resJSON = await fetch(
    `https://${host}:${port}/${pathname}/image_delete`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
    }
  );
  if (resJSON.status === 200) {
    location.reload();
  } else if (resJSON.status === 500) {
    popup("😢", "Server Error", "Please try again later or refresh the page.");
  }
});
changePasswordSubmitButton.addEventListener("click", async (event) => {
  event.preventDefault();
  if (
    isPasswordValid(oldPassword.value) &&
    isPasswordValid(newPassword.value)
  ) {
    const resJSON = await fetch(
      `https://${host}:${port}/${pathname}/change_password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPassword.value,
          newPassword: newPassword.value,
        }),
      }
    );
    if (resJSON.status === 401) {
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
        "Wrong Old Password",
        "Please check your old password and try again."
      );
    } else if (resJSON.status === 200) {
      oldPassword.value = "";
      newPassword.value = "";
      changePasswordButton.click();
      popup(
        "😊",
        "Change Successful",
        "Your old password has been changed.",
        false
      );
      setTimeout(() => {
        messageBoxBtn.click();
      }, 1000);
    }
  } else {
    popup("🤨", "Invalid password", "Please enter the passwords correctly.");
  }
});
