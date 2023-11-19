// Initialize
require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");

const express = require("express");
const app = express();
const EXPRESS_SERVER_PORT = process.env.EXPRESS_SERVER_PORT || 8080;
const SOCKET_SERVER_PORT = process.env.SOCKET_SERVER_PORT || 8081;
const cors = require('cors');
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});

app.use(cors());
app.use(express.json());


// Express Routes /////////////////////////////////////////////////////////////////////
// Health Check
app.get("/", (_req, res) => { res.status(200).send("Express Server is running")});

app.listen(EXPRESS_SERVER_PORT, () => {
  console.log(`Express Server running: http://localhost:${EXPRESS_SERVER_PORT}`);
});


// Socket Server /////////////////////////////////////////////////////////////////////
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

httpServer.listen(SOCKET_SERVER_PORT, () => {
  console.log(`Socket Server running: http://localhost:${SOCKET_SERVER_PORT}`);
});