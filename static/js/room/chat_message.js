// All Global Variables ----------------------------------------------------------------
const socket = io();
const participantContent = document.querySelector(".participant-content");
const hostMessage = document.getElementById("host-message");
const allowBtn = document.getElementById("allow-btn");
const denyBtn = document.getElementById("deny-btn");
const declineBtn = document.getElementById("decline-btn");
const hangUpBtn = document.getElementById("hang-up-btn");
const sendMessageBtn = document.getElementById("send-message-btn");
const chat = document.getElementById("chat");

let recentPermissionRequesterName;
let recentPermissionRequesterSocketID;
let recentPermissionRequesterPeerID;
let permissionRequestersQueue = [];

// All Global Functions ----------------------------------------------------------------
setInterval(function urlCheck() {
  if (roomID === sessionStorage.getItem("roomID")) {
    location.href = "/home";
  }
}, 100);
function addName(participantName, socketID) {
  const element = document.createElement("p");
  element.classList.add("name");
  element.id = socketID;
  element.innerText = participantName;
  participantContent.firstElementChild.appendChild(element);
}
function joinAndLeaveMessage(name, type) {
  const joiningMessage = document.querySelector(".joining-message");
  if (type === "join") {
    joiningMessage.innerText = `${name} joined.`;
  } else if (type === "leave") {
    joiningMessage.innerText = `${name} left.`;
  } else if (type === "screen") {
    joiningMessage.innerText = `${name} is presenting.`;
  }
  joiningMessage.classList.add("message-visible");
  setTimeout(() => {
    joiningMessage.classList.remove("message-visible");
  }, 2000);
}
function timeStringFunction() {
  const time = new Date();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  if (hours < 12) {
    if (minutes < 10) {
      return `${hours}:0$ minutes} AM`;
    }
    return `${hours}:${minutes} AM`;
  } else {
    if (minutes < 10) {
      return `${hours === 12 ? hours : hours - 1}:0${minutes} PM`;
    }
    return `${hours === 12 ? hours : hours - 1}:${minutes} PM`;
  }
}
function addChatMessage(chatMessage, timeString, type = "local") {
  const p = document.createElement("p");
  const span = document.createElement("span");
  if (type === "remote") p.classList.add("left");
  p.innerText = chatMessage;
  span.innerText = timeString;
  p.appendChild(span);
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

// All Event Listeners ----------------------------------------------------------------
// Document Events ----------------
allowBtn.addEventListener("click", () => {
  socket.emit(
    "join-permission-response",
    true,
    recentPermissionRequesterName,
    recentPermissionRequesterSocketID,
    recentPermissionRequesterPeerID
  );
  hostMessage.classList.remove("host-message-visible");
});
denyBtn.addEventListener("click", () => {
  socket.emit(
    "join-permission-response",
    false,
    recentPermissionRequesterName,
    recentPermissionRequesterSocketID,
    recentPermissionRequesterPeerID
  );
  hostMessage.classList.remove("host-message-visible");
});
hangUpBtn.addEventListener("click", () => {
  peer.destroy();
  socket.disconnect();
  sessionStorage.setItem("roomID", roomID);
  const isSure = confirm("Are you sure you want to Hang up ?");
  if (isSure) {
    location.href = "/home";
  }
});
sendMessageBtn.addEventListener("click", () => {
  const chatMessage = messageText.value;
  if (
    !/^\s\s{1,}/.test(chatMessage) &&
    chatMessage !== "" &&
    chatMessage !== " "
  ) {
    const timeString = timeStringFunction();
    addChatMessage(chatMessage, timeString, "local");
    socket.emit("sending-message", chatMessage, timeString);
    messageText.value = "";
  }
});

// Socket Events ----------------
socket.on("connect", () => {
  addName(`YOU: ${myName}`, socket.id);
  peer.on("open", () => {
    localVideoStart();
    socket.emit("new-user-joined-ingoing", roomID, myName, socket.id, peer.id);
    globalUsers.push({ name: myName, socketID: socket.id, peerID: peer.id });
  });
});
socket.on(
  "joining-permission-requested",
  (newParticipantName, socketID, peerID) => {
    if (!hostMessage.classList.contains("host-message-visible")) {
      hostMessage.firstElementChild.innerText = `${newParticipantName} want to join the room ?`;
      hostMessage.classList.add("host-message-visible");
      recentPermissionRequesterName = newParticipantName;
      recentPermissionRequesterSocketID = socketID;
      recentPermissionRequesterPeerID = peerID;
    } else {
      permissionRequestersQueue.push([newParticipantName, socketID, peerID]);
      setInterval(function check() {
        if (
          !hostMessage.classList.contains("host-message-visible") &&
          permissionRequestersQueue.length > 0
        ) {
          [
            recentPermissionRequesterName,
            recentPermissionRequesterSocketID,
            recentPermissionRequesterPeerID,
          ] = permissionRequestersQueue.shift();
          hostMessage.firstElementChild.innerText = `${recentPermissionRequesterName} want to join the room ?`;
          hostMessage.classList.add("host-message-visible");
        } else if (permissionRequestersQueue.length === 0) {
          clearInterval(check);
        }
      }, 3000);
    }
  }
);
socket.on(
  "new-user-joined-outgoing",
  (newParticipantName, socketID, peerID) => {
    if (socketID !== socket.id) {
      callNewUser(peerID, newParticipantName);
      addName(newParticipantName, socketID);
      joinAndLeaveMessage(newParticipantName, "join");
      socket.emit(
        "send-my-details-to-new-user",
        myName,
        socket.id,
        peer.id,
        socketID
      );
      if (myScreenStream) {
        setTimeout(() => {
          peer.call(peerID, myScreenStream);
        }, 5000);
      }
      globalUsers.push({ name: newParticipantName, socketID, peerID });
    }
  }
);
socket.on(
  "receiving-old-participant-details",
  (oldParticipantName, oldParticipantSocketID, oldParticipantPeerID) => {
    addName(oldParticipantName, oldParticipantSocketID);
    // Extra security to add name in remote videos if the socket response get delayed
    setTimeout(() => {
      if (document.getElementById(oldParticipantPeerID));
      addNameToVideo(oldParticipantPeerID, oldParticipantName);
    }, 3000);
    globalUsers.push({
      name: oldParticipantName,
      socketID: oldParticipantSocketID,
      peerID: oldParticipantPeerID,
    });
  }
);
socket.once("permission-denied", () => {
  peer.destroy();
  const element = document.getElementById("decline-message");
  element.classList.add("host-message-visible");
  declineBtn.addEventListener("click", () => {
    location.href = "/home";
  });
});
socket.on("receiving-message", (chatMessage, time) => {
  addChatMessage(chatMessage, time, "remote");
});
socket.on("participant-disconnected", (socketID) => {
  joinAndLeaveMessage(document.getElementById(socketID).innerText, "leave");
  const disconnectedUserDetails = globalUsers.find(
    (obj) => obj.socketID === socketID
  );
  document.getElementById(disconnectedUserDetails.peerID).remove();
  document.getElementById(disconnectedUserDetails.peerID+"present")?.remove();
  document.getElementById(socketID).remove();
  globalUsers.splice(globalUsers.indexOf(disconnectedUserDetails), 1);
});
socket.on("host-left", () => {
  peer.destroy();
  document
    .querySelector(".host-leave-notification")
    .classList.add("host-leave-notification-visible");
  setTimeout(() => {
    location.href = "/home";
  }, 3000);
  globalUsers = undefined;
});
socket.on("disconnect", () => {
  peer.destroy();
});
