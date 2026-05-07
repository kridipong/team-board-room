# Team Board Room

Collaborative whiteboard app. Backend here (Node.js + Express + Socket.io), deployed on Render.

## Repos
- **Backend (this):** https://github.com/kridipong/team-board-room → deployed at https://team-board-room.onrender.com
- **Frontend:** https://github.com/kridipong/team-board → deployed at https://team-board-ten-red.vercel.app

## Architecture
- `server.js` — Socket.io room server, persists scene to `rooms.json` on disk
- `index.js` — entry point for Render
- Frontend: Next.js 16 + Excalidraw 0.18 + socket.io-client
- Key frontend file: `app/components/Board.tsx`

## Known issue (still wonky, to be fixed)
Real-time sync between users is partially working but still has edge cases:
- Drawings mostly sync but there may still be occasional overwrite/flicker issues
- Root cause area: `handleChange` fingerprint-based echo prevention in `Board.tsx`
- The fingerprint approach (`element ID + version`) prevents re-broadcasting remote updates,
  but concurrent draws from two users may still conflict (last-writer-wins on the server)

## What was fixed so far
- Render deploy: added `index.js` entry point
- Version conflict: server now manages its own authoritative version counter
- Echo loop: replaced `requestAnimationFrame` flag with content fingerprinting in `Board.tsx`

## How to deploy changes
- **Backend:** push to `master` → Render auto-deploys
- **Frontend:** run `vercel --prod --yes` from `~/Desktop/team-board` (needs Node 20 via nvm)
