# Team Board Room — Backend

Node.js + Express + Socket.io server for the collaborative whiteboard app.

## Repos & Deployments
- **Backend (this):** https://github.com/kridipong/team-board-room → https://team-board-room.onrender.com
- **Frontend:** https://github.com/kridipong/team-board → https://team-board-ten-red.vercel.app

## Architecture
- `server.js` — Socket.io room server, persists scene to `rooms.json` on disk (debounced, 1s)
- `index.js` — entry point for Render (just requires server.js)
- Rooms identified by `roomId` (currently always `"main"`)
- Server manages its own authoritative version counter (always increments, never rejects)

## Socket events
| Event | Direction | Payload |
|---|---|---|
| `join-room` | client → server | `{ roomId }` |
| `room-init` | server → client | `{ elements, version }` |
| `scene-update` | both | `{ roomId, elements, version }` |
| `pointer-update` | both | `{ roomId, pointer, button, selectedElementIds, username }` |
| `user-left` | server → client | `{ socketId }` |

## What was fixed
- **Render deploy:** added `index.js` entry point (Render ran `node index.js` but only `server.js` existed)
- **Version conflict:** server now manages authoritative version counter instead of rejecting lower-version updates from late-joining clients
- **Echo loop:** frontend replaced `requestAnimationFrame` flag with content fingerprinting in `Board.tsx`
- **Read-only bug:** fingerprint approach fixed the issue where a 2nd user joining made the board read-only for all users

## Known issue (open)
Concurrent draws from two users may conflict — last-writer-wins on the server (no CRDT). Root cause area: `handleChange` fingerprinting in `Board.tsx` prevents echo but doesn't resolve write conflicts.

## How to deploy
- **Backend:** push to `master` → Render auto-deploys
- **Frontend:** `vercel --prod --yes` from `~/Desktop/team-board` (needs Node 20 via nvm)
