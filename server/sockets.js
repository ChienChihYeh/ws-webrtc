import { Server } from "socket.io";

export function createSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://127.0.0.1/:5173",
    },
  });
  return io;
}

export function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("user connected");

    socket.on("message", (data) => {
      socket.broadcast.emit("message", data);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}
