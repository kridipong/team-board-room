const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.get("/", (_, res) => res.send("Team Board Room Server running"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const DATA_FILE = path.join(__dirname, "rooms.json");

// Load persisted state from disk on startup
function loadRooms() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      return new Map(Object.entries(data));
    }
  } catch (e) {
    console.error("Failed to load rooms from disk:", e.message);
  }
  return new Map();
}

// Debounced save so we don't hammer disk on every stroke
let saveTimer = null;
function scheduleSave(rooms) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const obj = Object.fromEntries(rooms);
      fs.writeFileSync(DATA_FILE, JSON.stringify(obj), "utf8");
    } catch (e) {
      console.error("Failed to save rooms to disk:", e.message);
    }
  }, 1000);
}

const rooms = loadRooms();

io.on("connection", (socket) => {
  let currentRoom = null;

  socket.on("join-room", ({ roomId }) => {
    currentRoom = roomId;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { elements: [], version: 0 });
    }

    const state = rooms.get(roomId);
    console.log(`[join-room] socket=${socket.id} room=${roomId} elements=${state.elements.length} version=${state.version}`);
    socket.emit("room-init", state);
  });

  socket.on("scene-update", ({ roomId, elements, version }) => {
    const room = rooms.get(roomId);
    console.log(`[scene-update] socket=${socket.id} room=${roomId} elements=${elements?.length} version=${version} room.version=${room?.version}`);

    if (!room || version < room.version) {
      console.log(`[scene-update] REJECTED version=${version} room.version=${room?.version}`);
      return;
    }

    rooms.set(roomId, { elements, version });
    scheduleSave(rooms);
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
