// All Global Variables ----------------------------------------------------------------
const pageName = window.location.pathname.substring(1);
const body = document.getElementsByTagName("body")[0];
const mainContainer = document.querySelector(".main-container");
const crossIcon = document.getElementById("cross-icon");
const sidebar = document.querySelector(".sidebar");
const main = document.getElementById("main");
const menuIcon = document.getElementById("menu-icon");
const AnimationAudioTrack = document.getElementById("animation-audio-track");

// All Event Listeners ----------------------------------------------------------------
window.onload = () => {
  Array.from(document.querySelectorAll(".routes")).forEach((route) => {
    if (route.innerHTML.toLowerCase() === pageName) {
      route.style.color = "#2bff00";
    }
  });
  const appearance = JSON.parse(localStorage.getItem("appearance"));
  if (appearance) {
    if (appearance.backgroundColor) {
      mainContainer.style.background = appearance.backgroundColor;
    }
    body.style.setProperty("--primary-font-color", appearance.fontColor);
    body.style.filter = `brightness(${appearance.brightnessInput}%)`;
  }
};
crossIcon.addEventListener("click", () => {
  AnimationAudioTrack.play();
  sidebar.classList.add("sidebar-hidden");
  main.classList.add("full-screen");
  menuIcon.classList.add("menu-icon-visible");
  sidebar.classList.remove("sidebar-visible");
});
menuIcon.addEventListener("click", () => {
  AnimationAudioTrack.play();
  sidebar.classList.remove("sidebar-hidden");
  main.classList.remove("full-screen");
  menuIcon.classList.remove("menu-icon-visible");
  sidebar.classList.add("sidebar-visible");
});
