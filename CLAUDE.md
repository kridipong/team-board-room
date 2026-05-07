# Team Board Room

Collaborative whiteboard app. Backend here (Node.js + Express + Socket.io), deployed on Render.

## Architecture
- `server.js` — main server, Socket.io rooms, scene-update/pointer-update events, persists to `rooms.json`
- `index.js` — entry point for Render (just requires server.js)
- Frontend is a separate repo (React + Excalidraw), NOT in this repo yet

## Active Bug
When a second user joins a room, the board becomes read-only for ALL users — nobody can draw.
- Server-side has been ruled out (no read-only concept on server)
- Bug is in the **frontend** — likely in the `room-init` or `scene-update` handler triggering view-only mode when a second user is detected
- **Next step: push frontend code to GitHub so we can read and fix it**

## What was fixed
- Render deploy: was running `node index.js`, fixed by adding `index.js` entry point
- Version conflict: server was rejecting scene-updates from second user due to version mismatch — now server manages its own authoritative version
