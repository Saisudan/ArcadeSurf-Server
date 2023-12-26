// Initialize
require("dotenv").config();
const EXPRESS_SERVER_PORT = process.env.EXPRESS_SERVER_PORT || 8080;
const SOCKET_SERVER_PORT = process.env.SOCKET_SERVER_PORT || 8081;

const express = require("express");
const app = express();
const cors = require('cors');
const userRoutes = require("./routes/users");

const knex = require('knex')(require('./knexfile'));
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// Express Routes /////////////////////////////////////////////////////////////////////
// Health Check
app.get("/", (_req, res) => { res.status(200).send("Express Server is running")});

app.use("/users", userRoutes);

app.listen(EXPRESS_SERVER_PORT, () => {
  console.log(`Express Server running: http://localhost:${EXPRESS_SERVER_PORT}`);
});


// Socket Server /////////////////////////////////////////////////////////////////////
io.on("connection", (socket) => {
  console.log("connected");

  // Allows users to create a lobby
  socket.on("create-room", async (receivedData) => {
    try {
      const { username } = receivedData;

      // Create the lobby and add the user to it
      const newLobby = {
        match_id: null,
        progress: 0,
        status: "queueing",
        is_done: false,
        on_hold: false,
        visibility: "public",
        password: null
      };
      const newLobbyID = await knex('lobbies').insert(newLobby);
      const currentUser = await knex('users').where({ username: username }).first();
      await knex('users_to_lobbies').insert({ user_id: currentUser.id, lobby_id: newLobbyID });
      socket.emit("created-room", newLobbyID);

    } catch (error) {
      console.log(error);
      return;
    }
  });

  // Allows users to join a lobby
  socket.on("join-room", async (receivedData) => {
    try {
      const { roomID, username } = receivedData;

      // Check if the lobby exists in the database
      const joinedRoom = await knex('lobbies').where({ id: roomID }).first();
      const currentUser = await knex('users').where({ username: username }).first();
      const isInLobby = await knex('users_to_lobbies').where({ lobby_id: roomID, user_id: currentUser.id }).first();
      if (!joinedRoom) {
        // Couldn't find room
        socket.emit("failed-join");
        return;
      } else if (isInLobby) {
        // Found that this user already joined this room previously
        const activePlayers = await knex('users_to_lobbies')
          .where({ lobby_id: roomID })
          .join('users', 'users.id', 'users_to_lobbies.user_id')
          .select('users.username', 'users_to_lobbies.*');
        socket.join(joinedRoom.id);
        socket.emit("joined-room", activePlayers);
        socket.to(joinedRoom.id).emit("players-in-room", activePlayers);

// Add in logic here to check if user is allowed to join, check room size, visibility, password, etc.
      
      } else {
        // For authenticated users
        await knex('users_to_lobbies').insert({ user_id: currentUser.id, lobby_id: joinedRoom.id });
        const activePlayers = await knex('users_to_lobbies')
          .where({ lobby_id: roomID })
          .join('users', 'users.id', 'users_to_lobbies.user_id')
          .select('users.username', 'users_to_lobbies.*');
        socket.join(joinedRoom.id);
        socket.emit("joined-room", activePlayers);
        socket.to(joinedRoom.id).emit("players-in-room", activePlayers);
      }
    } catch (error) {
      console.log(error);
      return;
    }
  });

  // Allows users to leave a lobby
  socket.on("leave-room", async (receivedData) => {
    try {
      const { roomID, username } = receivedData;

      // Remove user from lobby
      const currentUser = await knex('users').where({ username: username }).first();
      await knex('users_to_lobbies').del().where({ lobby_id: roomID, user_id: currentUser.id });
      socket.leave(roomID);
      socket.emit("left-room");

      // Update the other players in the room
      const activePlayers = await knex('users_to_lobbies')
        .where({ lobby_id: roomID })
        .join('users', 'users.id', 'users_to_lobbies.user_id')
        .select('users.username', 'users_to_lobbies.*');
      socket.to(roomID).emit("players-in-room", activePlayers);
    } catch (error) {
      console.log(error);
      return;
    }
  });

  socket.on("won-game", (receivedData) => {
    const { roomID, username } = receivedData;
    const winner = username;
    socket.to(roomID).emit("lost-game", winner);
  });

  socket.on("current-player-position", (receivedData) => {
    const { room } = receivedData;
    socket.to(room).emit("other-player-positions", receivedData);
  });

  socket.on("player-ready", (receivedData) => {
    const { roomID, username } = receivedData;
    socket.emit("confirmed-ready");
  });

  socket.on("start-game", (receivedData) => {
    const { roomID, username } = receivedData;
    socket.emit("confirmed-start");
    socket.to(roomID).emit("confirmed-start");
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});


httpServer.listen(SOCKET_SERVER_PORT, () => {
  console.log(`Socket Server running: http://localhost:${SOCKET_SERVER_PORT}`);
});