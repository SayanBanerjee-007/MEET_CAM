// All Global Variables ----------------------------------------------------------------
const backgroundColor = document.getElementById("background-color");
const fontColor = document.getElementById("font-color");
const brightnessInput = document.getElementById("brightness-input");
const resetButton = document.getElementById("reset-button");
const saveButton = document.getElementById("save-button");

// All Event Listeners ----------------------------------------------------------------
backgroundColor.addEventListener("input", () => {
  mainContainer.style.background = backgroundColor.value;
  backgroundColor.dataset.used = "true";
});
fontColor.addEventListener("input", () => {
  body.style.setProperty("--primary-font-color", fontColor.value);
});
brightnessInput.addEventListener("input", () => {
  body.style.filter = `brightness(${brightnessInput.value}%)`;
});
saveButton.addEventListener("click", () => {
  const appearance = {};
  if (backgroundColor.dataset.used === "true") {
    appearance.backgroundColor = backgroundColor.value;
  } else {
    appearance.backgroundColor = null;
  }
  appearance.fontColor = fontColor.value;
  appearance.brightnessInput = brightnessInput.value;
  localStorage.setItem("appearance", JSON.stringify(appearance));
});
resetButton.addEventListener("click", () => {
  localStorage.removeItem("appearance");
  location.reload();
});
