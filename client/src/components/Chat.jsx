//https://dev.to/eyitayoitalt/develop-a-video-chat-app-with-webrtc-socketio-express-and-react-3jc4
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  initiateChat,
  handleMakecall,
  handleHangUp,
  toggleMute,
} from "../utils/chatHandler";

const socket = io("http://localhost:3000", { transports: ["websocket"] });

export default function Chat() {
  // React has no native support for srcObject
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [isHangUpEnabled, setIsHangUpEnabled] = useState(false);
  const [isStartEnabled, setIsStartEnabled] = useState(true);
  const [isMuteEnabled, setIsMuteEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    initiateChat(
      socket,
      remoteVideo,
      setIsStartEnabled,
      setIsHangUpEnabled,
      setIsMuteEnabled
    );
  }, []);

  localVideo.current.muted = isMuted;

  return (
    <>
      <main className="container  ">
        <div className="video bg-main">
          <video
            ref={localVideo}
            className="video-item"
            autoPlay
            playsInline
          ></video>
          <video
            ref={remoteVideo}
            className="video-item"
            autoPlay
            playsInline
          ></video>
        </div>

        <div className="btn">
          <button
            className="btn-item btn-start"
            disabled={!isStartEnabled}
            onClick={() => {
              handleMakecall(
                socket,
                localVideo,
                setIsStartEnabled,
                setIsMuteEnabled,
                setIsHangUpEnabled
              );
            }}
          >
            Call
          </button>
          <button
            className="btn-item btn-end"
            disabled={!isHangUpEnabled}
            onClick={() => {
              handleHangUp(socket);
            }}
          >
            Hang Up
          </button>
          <button
            className="btn-item btn-start"
            disabled={!isMuteEnabled}
            onClick={() => toggleMute(setIsMuted)}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </main>
    </>
  );
}
