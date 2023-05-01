// All Global Variables ---------------------------------------------------------------
const globalUsers = [];
const participantNavBtn = document.getElementById("participant-nav-btn");
const messageNavBtn = document.getElementById("message-nav-btn");
const messageContent = document.getElementById("message-content");
const copyUrlBtn = document.getElementById("copy-url-btn");
const messageText = document.getElementById("message-text");

// All Global Functions ---------------------------------------------------------------
// All Event Listeners ----------------------------------------------------------------
participantNavBtn.addEventListener("click", () => {
  messageContent.classList.remove("visible");
  participantNavBtn.firstElementChild.style.color = "#2bff00";
  messageNavBtn.firstElementChild.style.color = "white";
});
messageNavBtn.addEventListener("click", () => {
  messageContent.classList.add("visible");
  messageNavBtn.firstElementChild.style.color = "#2bff00";
  participantNavBtn.firstElementChild.style.color = "white";
});
copyUrlBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(location.href);
});
messageText.addEventListener("keydown", (event) => {
  event.key === "Enter" ? sendMessageBtn.click() : false;
});

// For Devices( max-width: 900px) ------------------------------------------------------
const menuBtn = document.getElementById("menu-btn");
const menuList = document.getElementById("menu-list");
const menuListParticipantMessageBtn = document.getElementById(
  "menu-list-participant-message-btn"
);
const menuListPresentScreenBtn = document.getElementById(
  "menu-list-present-screen-btn"
);
const menuListCopyLinkBtn = document.getElementById("menu-list-copy-link-btn");
const rightSideCrossBtn = document.getElementById("right-side-cross-btn");

menuBtn.addEventListener("click", () => {
  menuList.classList.toggle("visible");
  setTimeout(() => {
    if (menuList.classList.contains("visible")) {
      menuList.classList.remove("visible");
    }
  }, 10000);
});

menuListParticipantMessageBtn.addEventListener("click", () => {
  menuList.classList.remove("visible");
  document.querySelector(".right-side").classList.add("visible");
  document.querySelector(".participant-message").classList.add("visible");
  localVideoGrid.classList.add('remove-translate');
  localVideoGrid.classList.add("invisible");
});
menuListPresentScreenBtn.addEventListener("click", () => {
  presentScreenBtn.click();
  menuList.classList.remove("visible");
});
menuListCopyLinkBtn.addEventListener("click", () => {
  copyUrlBtn.click();
  menuList.classList.remove("visible");
});
rightSideCrossBtn.addEventListener("click", () => {
  document.querySelector(".right-side").classList.remove("visible");
  document.querySelector(".participant-message").classList.remove("visible");
  localVideoGrid.classList.remove('remove-translate');
  localVideoGrid.classList.remove("invisible");
});
