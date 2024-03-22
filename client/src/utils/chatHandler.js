import { iceConfig } from "../configs/iceConfig";

const configuration = iceConfig;
let localStream;
let pc;

export function initiateChat(
  socket,
  remoteVideo,
  setIsStartEnabled,
  setIsHangUpEnabled,
  setIsMuteEnabled
) {
  socket.on("message", (e) => {
    if (!localStream) return console.log("local stream is not ready");
    switch (e.type) {
      case "offer":
        handleOffer(e, socket, remoteVideo);
        break;
      case "answer":
        handleAnswer(e);
        break;
      case "candidate":
        handleCandidate(e);
        break;
      case "ready":
        if (pc) return console.log("call is already initiated");
        makeCall(socket, remoteVideo);
        break;
      case "bye":
        if (pc) {
          hangUp(setIsHangUpEnabled, setIsStartEnabled, setIsMuteEnabled);
        }
        break;
      default:
        console.log("unhandled event: ", e);
        break;
    }
  });
}

async function makeCall(socket, remoteVideo) {
  try {
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = (e) => {
      const message = {
        type: "candidate",
        candidate: null,
      };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      socket.emit("message", message);
    };
    pc.ontrack = (e) => {
      remoteVideo.current.srcObject = e.streams[0];
    };
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
    const offer = await pc.createOffer();
    socket.emit("message", { type: "offer", sdp: offer.sdp });
    await pc.setLocalDescription(offer);
  } catch (e) {
    console.log(e);
  }
}

async function hangUp(setIsHangUpEnabled, setIsStartEnabled, setIsMuteEnabled) {
  if (pc) {
    pc.close();
    pc = null;
  }
  localStream.getTracks().forEach((track) => track.stop());
  localStream = null;
  setIsHangUpEnabled(false);
  setIsStartEnabled(true);
  setIsMuteEnabled(false);
}

async function handleOffer(offer, socket, remoteVideo) {
  if (pc) return console.error("Peer connection already exists");

  try {
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = (e) => {
      const message = {
        type: "candidate",
        candidate: null,
      };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      socket.emit("message", message);
    };
    pc.ontrack = (e) => {
      remoteVideo.current.srcObject = e.streams[0];
    };
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    socket.emit("message", { type: "answer", sdp: answer.sdp });
    await pc.setLocalDescription(answer);
  } catch (e) {
    console.log(e);
  }
}

async function handleAnswer(answer) {
  if (!pc) {
    return console.error("no peerconnection");
  }
  try {
    await pc.setRemoteDescription(answer);
  } catch (e) {
    console.log(e);
  }
}

async function handleCandidate(candidate) {
  try {
    if (!pc) {
      console.error("no peerconnection");
      return;
    }
    if (!candidate) {
      await pc.addIceCandidate(null);
    } else {
      await pc.addIceCandidate(candidate);
    }
  } catch (e) {
    console.log(e);
  }
}

export async function handleMakecall(
  socket,
  localVideo,
  setIsStartEnabled,
  setIsMuteEnabled,
  setIsHangUpEnabled
) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: { echoCancellation: true },
    });
    localVideo.current.srcObject = localStream;
    setIsStartEnabled(false);
    setIsMuteEnabled(true);
    setIsHangUpEnabled(true);

    socket.emit("message", { type: "ready" });
  } catch (e) {
    console.log(e);
  }
}

export function handleHangUp(socket) {
  socket.emit("message", { type: "bye" });
}

export function toggleMute(setIsMuted) {
  setIsMuted((prev) => !prev);
}
