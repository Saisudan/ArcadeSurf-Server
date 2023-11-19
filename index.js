require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");

const express = require("express");
const app = express();
const PORT = process.env.PORT;
const cors = require('cors');
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("join-room", (roomName) => {
      console.log(`room: ${roomName}`)
      socket.join(roomName);
      socket.emit("joined-room", roomName)
  })

  socket.on("leave-room", (leavingRoomName) => {
      console.log(`left room: ${leavingRoomName}`);
      socket.leave(leavingRoomName)
      socket.emit("left-room")
  })

  

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`)
  })
});

httpServer.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});