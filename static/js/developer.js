// All Global Variables ----------------------------------------------------------------
const imageDiv = document.querySelector(".image-div");
const myImage = document.getElementById("my-image");
const mobileAlert = document.getElementById("mobile-alert");
const toggleButton = document.getElementById("toggle-button");
const toggleButtonImage = document.getElementById("toggle-button-image");

// All Global Functions ----------------------------------------------------------------
function rotateImage(event) {
  const x = event.clientX;
  const y = event.clientY;

  const middleX = myImage.getBoundingClientRect().left + myImage.width / 2;
  const middleY = myImage.getBoundingClientRect().top + myImage.height / 2;

  const offsetX = ((x - middleX) / middleX) * 45;
  const offsetY = ((y - middleY) / middleY) * 45;

  imageDiv.style.setProperty("--rotateX", -1 * offsetY + "deg");
  imageDiv.style.setProperty("--rotateY", offsetX + "deg");
}

// All Event Listeners ----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 900) {
    mobileAlert.style.display = "block";
    toggleButtonImage.click();
  }
});
document.addEventListener("mousemove", rotateImage);
toggleButtonImage.addEventListener("click", () => {
  if (toggleButton.checked) {
    document.removeEventListener("mousemove", rotateImage);
    imageDiv.style.setProperty("--rotateX", 0 + "deg");
    imageDiv.style.setProperty("--rotateY", 0 + "deg");
  } else {
    document.addEventListener("mousemove", rotateImage);
  }
});
