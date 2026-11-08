# ESCAPE Adventure backend

## Audit findings

The repository already had an Express server, `/api/v1` routes, TypeScript record interfaces, and IndexedDB/localStorage persistence. The original API router was an in-memory demo store (lost on restart), returned the same guest for every caller, accepted arbitrary objects via object spread, and allowed any origin with wildcard CORS. The browser game uses IndexedDB/localStorage for its real offline save/settings flow; it did not call the REST API. No configured database driver, database migration runner, authentication provider, or durable server repository was present.

## Current implementation

- The API now uses a small durable JSON player repository at `DATA_DIR/escape-data.json` (default `.data/escape-data.json`). Writes are serialized and atomically replace the data file. This is a practical single-instance storage adapter, not a substitute for PostgreSQL in a multi-instance deployment.
- `POST /api/v1/auth/guest` creates a unique guest and returns an HMAC-signed bearer token. No passwords or account credentials are collected. Protected routes use the bearer identity rather than a caller-controlled player ID.
- Authenticated APIs: `GET /players/me`, `DELETE /players/me`, `GET|PUT /profiles/me`, `GET|PUT /settings/me`, and `GET|PUT /saves/me`.
- Save writes require a matching `expectedRevision` and version 1 payload. A stale revision receives HTTP 409; this endpoint stores client backup data only and does not award XP, currency, achievements, or mission rewards. Local gameplay remains authoritative and offline-first.
- Inputs are allowlisted and validated. Request body size, basic per-IP rate limits, secure response headers, same-origin default CORS, optional origin allowlisting, structured request logs, health checks, and graceful HTTP shutdown are configured.

## Configuration and operations

Copy `.env.example` to `.env` for local work. For a production deployment set `NODE_ENV=production`, `SESSION_SECRET` to a unique random secret of at least 32 characters, `DATA_DIR` to durable persistent storage, and `ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins if cross-origin requests are needed. Do not mount `.data` as ephemeral storage if data must survive restarts. Deploy only one server instance with the JSON store; use a transactional SQL adapter and migrations before horizontal scaling or public competitive progression. No external service is contacted or deployed by this change.

Commands: `npm run lint`, `npm run build`, `npm run start`. The backend does not claim that a guest-only, local/offline game is cheat-proof. Cloud save payloads are untrusted client backups and are never treated as authoritative reward events.

## Remaining work / limitations

- The existing React app has not yet been wired to this optional API; its IndexedDB/localStorage remains the active persistence and keeps offline play functional. A later cloud-sync phase should explicitly integrate the token and revision protocol with local saves and define user-controlled merge UX.
- Guest identities are not recoverable across device/browser storage loss. Account registration, passwords, recovery, and account linking are intentionally not invented.
- JSON storage is single-process/single-instance only; there are no relational DB migrations, transaction-backed reward ledger, multiplayer authority, or external monitoring provider.
- The in-memory IP limiter is a basic per-process guard, not a distributed abuse defense. Configure proxy trust only for a trusted reverse proxy.
