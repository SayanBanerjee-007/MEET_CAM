// All Global Variables ----------------------------------------------------------------
const host = location.hostname;
const port = location.port;
const peer = new Peer(undefined, {
  host,
  secure: true,
  port,
  path: "peerJS",
});
const myVideo = document.createElement("video");
myVideo.muted = true;
const localStream = new MediaStream();
const localVideoGrid = document.getElementById("local-video-grid");
const remoteVideoGrid = document.getElementById("remote-video-grid");
const cameraBtn = document.getElementById("camera-btn");
const micBtn = document.getElementById("mic-btn");
const presentScreenBtn = document.getElementById("present-screen-btn");

let myScreenStream = null;

// All Global Functions ----------------------------------------------------------------
function getLocalMediaStream(video, audio) {
  if (!audio && !video) return null;
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ audio, video: { facingMode: "user" } })
      .then((stream) => {
        if (video && audio) {
          resolve([stream.getVideoTracks()[0], stream.getAudioTracks()[0]]);
        } else if (video) {
          resolve([stream.getVideoTracks()[0]]);
        } else if (audio) {
          resolve([stream.getAudioTracks()[0]]);
        }
      })
      .catch((error) => reject(error));
  });
}
function getLocalScreen() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: false })
      .then((stream) => {
        resolve(stream);
      })
      .catch((error) => reject(error));
  });
}
function addStream(type, stream, peerID = null, name = "", isScreen = false) {
  if (type === "local") {
    myVideo.srcObject = stream;
    myVideo.addEventListener("loadedmetadata", () => {
      myVideo.play();
    });
    localVideoGrid.appendChild(myVideo);
  } else if (type === "remote") {
    const divElement = document.createElement("div");
    divElement.id = peerID;
    divElement.classList.add("video-div");
    const videoElement = document.createElement("video");
    videoElement.srcObject = stream;
    if (isScreen) {
      videoElement.style.transform = "scaleX(1)";
    }
    videoElement.addEventListener("loadedmetadata", () => {
      videoElement.play();
    });
    const pElement = document.createElement("p");
    pElement.innerHTML = name;
    divElement.appendChild(videoElement);
    divElement.appendChild(pElement);
    remoteVideoGrid.appendChild(divElement);
  } else {
    throw new Error("add stream / wrong type");
  }
}
function addNameToVideo(peerID, name) {
  document.getElementById(peerID).lastElementChild.innerText = name;
}
const screenStreamInactive = () => {
  presentScreenBtn.click();
};
async function localVideoStart() {
  try {
    const [localVideoTrack, localAudioTrack] = await getLocalMediaStream(
      true,
      true
    );
    localStream.addTrack(localVideoTrack);
    localStream.addTrack(localAudioTrack);
    addStream("local", localStream);
  } catch (error) {
    throw new Error(error);
  }
}

function callNewUser(peerID, newParticipantName) {
  const callingObject = peer.call(peerID, localStream);
  callingObject.on("stream", (newUserStream) => {
    if (!document.getElementById(peerID)) {
      addStream("remote", newUserStream, peerID, newParticipantName);
    }
  });
}

// All Event Listeners ----------------------------------------------------------------
// Document Events ----------------
cameraBtn.addEventListener("click", async () => {
  if (!cameraBtn.classList.contains("camera-off")) {
    localStream.getVideoTracks()[0].stop();
    cameraBtn.title = "Turn on camera";
    socket.emit("media-update-ingoing", "video", peer.id);
  } else {
    const [localVideoTrack] = await getLocalMediaStream(true, false);
    localStream.removeTrack(localStream.getVideoTracks()[0]);
    localStream.addTrack(localVideoTrack);
    const length = globalUsers.length;
    for (let i = 1; i < length; i++) {
      peer.call(globalUsers[i].peerID, localStream);
    }
    cameraBtn.title = "Turn off camera";
  }
  cameraBtn.classList.toggle("camera-off");
  cameraBtn.classList.toggle("number-1");
});
micBtn.addEventListener("click", async () => {
  if (!micBtn.classList.contains("mic-off")) {
    localStream.getAudioTracks()[0].stop();
    micBtn.title = "Unmute";
    socket.emit("media-update-ingoing", "audio", peer.id);
  } else {
    const [localAudioTrack] = await getLocalMediaStream(false, true);
    localStream.removeTrack(localStream.getAudioTracks()[0]);
    localStream.addTrack(localAudioTrack);
    const length = globalUsers.length;
    for (let i = 1; i < length; i++) {
      peer.call(globalUsers[i].peerID, localStream);
    }
    micBtn.title = "Mute";
  }
  micBtn.classList.toggle("mic-off");
  micBtn.classList.toggle("number-1");
});
presentScreenBtn.addEventListener("click", async () => {
  if (!presentScreenBtn.classList.contains("red")) {
    try {
      myScreenStream = await getLocalScreen();
      myScreenStream.addEventListener("inactive", screenStreamInactive);
      const length = globalUsers.length;
      for (let i = 1; i < length; i++) {
        peer.call(globalUsers[i].peerID, myScreenStream);
      }
      document.getElementById(
        socket.id
      ).innerHTML = `YOU: ${myName} (presenting)`;
      presentScreenBtn.title = "Stop presenting screen";
      presentScreenBtn.classList.add("red");
    } catch (error) {
      alert("Present screen does not supported by your browser.");
    }
  } else {
    myScreenStream.getVideoTracks()[0].stop();
    socket.emit("media-update-ingoing", "screen", peer.id);
    myScreenStream.removeTrack(myScreenStream.getVideoTracks()[0]);
    document.getElementById(socket.id).innerHTML = `YOU: ${myName}`;
    myScreenStream.removeEventListener("inactive", screenStreamInactive);
    myScreenStream = null;
    presentScreenBtn.classList.remove("red");
  }
  menuListPresentScreenBtn.children[1].classList.toggle("invisible");
  menuListPresentScreenBtn.children[2].classList.toggle("invisible");
});

// Socket Events ----------------
socket.on("media-update-outgoing", (mediaType, peerID) => {
  const mediaStream =
    document.getElementById(peerID)?.firstElementChild.srcObject;
  if (mediaType === "video") {
    if (mediaStream.getAudioTracks()[0].readyState === "ended") {
      document.getElementById(peerID).remove();
    }
    mediaStream.getVideoTracks()[0].stop();
  } else if (mediaType === "audio") {
    if (mediaStream.getVideoTracks()[0].readyState === "ended") {
      document.getElementById(peerID).remove();
    }
    mediaStream.getAudioTracks()[0].stop();
  } else if (mediaType === "screen") {
    document.getElementById(peerID + "present").remove();
  }
});

// Peer Events -----------------
peer.on("call", (call) => {
  if (!document.getElementById(call.peer)) {
    call.answer(localStream);
    call.on("stream", (oldUserStream) => {
      const { name } = globalUsers.find((user) => user.peerID === call.peer);
      addStream("remote", oldUserStream, call.peer, name);
    });
  } else {
    call.answer(localStream);
    call.on("stream", (OldUserUpdatedOrScreenStream) => {
      const remoteVideoDiv = document.getElementById(call.peer);
      if (
        OldUserUpdatedOrScreenStream.id ===
        remoteVideoDiv.firstElementChild.srcObject.id
      ) {
        remoteVideoDiv.firstElementChild.srcObject =
          OldUserUpdatedOrScreenStream;
        remoteVideoDiv.firstElementChild.addEventListener(
          "loadedmetadata",
          () => {
            remoteVideoDiv.firstElementChild.play();
          }
        );
      } else {
        const { name } = globalUsers.find((user) => user.peerID === call.peer);
        addStream(
          "remote",
          OldUserUpdatedOrScreenStream,
          call.peer + "present",
          name + " (presenting)",
          true
        );
        joinAndLeaveMessage(name, "screen");
      }
    });
  }
});
