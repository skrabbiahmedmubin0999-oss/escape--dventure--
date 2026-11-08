# ESCAPE Adventure — Backend Phase 2 checkpoint

## Current architecture

The game is a React + TypeScript + Three.js PWA. `src/game/storage/StorageAdapter.ts` delegates primary local persistence to IndexedDB with localStorage fallback. The Express server (`server.ts`) exposes versioned routes implemented in `src/server/apiRouter.ts`; guest profiles, settings and versioned save payloads are persisted in a JSON file by `src/server/playerStore.ts`. No SQL driver, migration runner, external identity provider, or multiplayer transport is configured.

## API

All paths below are prefixed with `/api/v1`.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | API liveness |
| POST | `/auth/guest` | No | Create guest identity and HMAC bearer token |
| GET | `/players/me` | Bearer | Read current player identifier metadata |
| DELETE | `/players/me` | Bearer | Delete only the authenticated player's server record |
| GET / PUT | `/profiles/me` | Bearer | Read or allowlisted profile update |
| GET / PUT | `/settings/me` | Bearer | Read or validated settings patch |
| GET / PUT | `/saves/me` | Bearer | Read save or write version-1 payload with `expectedRevision` |

Save update request shape: `{ "expectedRevision": 0, "save": { "version": 1, "payload": {} } }`. Payload limit is 256 KiB (JSON request parser limit is 300 KiB). Writes to an outdated revision return HTTP 409 and do not replace the current save. Saves are untrusted backup blobs; they do not grant progression or rewards.

## Development and production

```sh
cp .env.example .env
npm install
npm run lint
npm test
npm run build
npm start
```

`server.ts` loads `.env` via the existing `dotenv` dependency. Production requires `NODE_ENV=production` and a unique `SESSION_SECRET` of at least 32 bytes (for example `openssl rand -hex 32`). Set `DATA_DIR` to durable storage and `ALLOWED_ORIGINS` to exact origins only when the browser app is hosted on another origin. Set `TRUST_PROXY=true` only behind a trusted single reverse proxy. `.data/` is private server data and ignored by Git.

## Offline and sync status

The game continues to use IndexedDB/localStorage as its active save/settings store. The backend API is **not yet integrated into `App.tsx`**; no guest token lifecycle, sync queue, backoff/retry, local/cloud revision metadata, or conflict-resolution UI currently exists. Do not display cloud-synced status. No gameplay request waits for the server.

## Security and known limitations

- API uses signed bearer tokens, server-derived player identity, allowlisted profile/settings patches, save payload limits, exact-origin CORS allowlisting, basic process-local rate limiting, generic internal error responses, security headers and a production secret check.
- Guest tokens are bearer credentials. The frontend integration must persist them only in an appropriate client-side mechanism and clear them on logout/deletion; local browser storage cannot protect against same-origin script compromise.
- JSON storage is single-process and single-instance only. The write queue protects one `PlayerStore` process; it is not a distributed lock and is not horizontally scalable. Atomic rename does not guarantee fsync-level recovery against all power loss scenarios.
- Invalid/corrupted JSON fails startup without overwriting the file. Preserve the file and restore a known-good backup; automatic recovery/migration is not implemented.
- Rate limiting is process-local, not a distributed abuse defense. Multiplayer, password accounts, account recovery/linking, authoritative progression/rewards, relational database migrations and external monitoring are not implemented.
- The frontend currently has local persistence and remains playable offline. A separate sync adapter and conflict UX are required before cloud sync can be described as implemented.

## Tests

`npm test` targets `src/server/*.test.ts`, including store persistence, revision conflict and token tests. HTTP route coverage and browser/offline integration coverage remain incomplete. Run the commands above in a Node environment with dependencies installed; do not infer passing status from the presence of test files.
