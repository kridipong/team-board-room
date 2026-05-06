const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.get("/", (_, res) => res.send("Team Board Room Server running"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// In-memory room state: roomId -> { elements, version }
const rooms = new Map();

io.on("connection", (socket) => {
  let currentRoom = null;

  socket.on("join-room", ({ roomId }) => {
    currentRoom = roomId;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { elements: [], version: 0 });
    }

    // Send existing scene to the new joiner
    socket.emit("room-init", rooms.get(roomId));
  });

  socket.on("scene-update", ({ roomId, elements, version }) => {
    const room = rooms.get(roomId);
    if (!room || version < room.version) return;

    rooms.set(roomId, { elements, version });
    // Broadcast to everyone else in the room
    socket.to(roomId).emit("scene-update", { elements, version });
  });

  socket.on("pointer-update", ({ roomId, pointer, button, selectedElementIds, username }) => {
    socket.to(roomId).emit("pointer-update", {
      socketId: socket.id,
      pointer,
      button,
      selectedElementIds,
      username,
    });
  });

  socket.on("disconnect", () => {
    if (currentRoom) {
      socket.to(currentRoom).emit("user-left", { socketId: socket.id });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Room server listening on port ${PORT}`));
