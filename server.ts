import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import express, { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiRouter, ApiError } from './src/server/apiRouter';
import { PlayerStore } from './src/server/playerStore';
import { createDevelopmentSecret } from './src/server/sessionToken';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app = express();
const portValue = Number(process.env.PORT || 3000);
if (!Number.isInteger(portValue) || portValue < 1 || portValue > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
const port = portValue;
const isProduction = process.env.NODE_ENV === 'production';
const secret = process.env.SESSION_SECRET;
if (isProduction && (!secret || Buffer.byteLength(secret, 'utf8') < 32)) {
  throw new Error('Production requires SESSION_SECRET with at least 32 bytes.');
}
const tokenSecret = secret || createDevelopmentSecret();
if (!secret) console.warn(JSON.stringify({ level: 'warn', message: 'SESSION_SECRET is unset; guest sessions will expire when this process restarts.' }));

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS || '');
const store = new PlayerStore();

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use((req, res, next) => {
  const requestId = req.header('x-request-id')?.slice(0, 100) || randomUUID();
  res.setHeader('x-request-id', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  const origin = req.header('origin');
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(origin && allowedOrigins.has(origin) ? 204 : 403);
  const startedAt = Date.now();
  res.on('finish', () => console.log(JSON.stringify({ level: 'info', requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt })));
  next();
});

const limits = new Map<string, { count: number; resetAt: number }>();
app.use('/api/v1', (req, res, next) => {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const isGuest = req.method === 'POST' && req.path === '/auth/guest';
  const key = `${ip}:${isGuest ? 'guest' : 'api'}`;
  let entry = limits.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + 60_000 };
    limits.set(key, entry);
  }
  entry.count += 1;
  const maximum = isGuest ? 10 : 120;
  res.setHeader('RateLimit-Limit', maximum);
  res.setHeader('RateLimit-Remaining', Math.max(0, maximum - entry.count));
  if (entry.count > maximum) return res.status(429).json({ success: false, error: { code: 'rate_limited', message: 'Too many requests. Try again shortly.' } });
  if (limits.size > 5000) {
    for (const [entryKey, value] of limits) if (value.resetAt <= now) limits.delete(entryKey);
    if (limits.size > 5000 && !limits.has(key)) return res.status(503).json({ success: false, error: { code: 'rate_limiter_capacity', message: 'Request capacity temporarily reached.' } });
  }
  next();
});
app.use(express.json({ limit: '300kb', strict: true, type: 'application/json' }));
app.use('/api/v1', createApiRouter(store, tokenSecret));
app.use('/api', (_req, res) => res.status(404).json({ success: false, error: { code: 'not_found', message: 'API route not found.' } }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use(express.static(path.join(dirname, 'dist'), { index: false, maxAge: isProduction ? '1h' : 0 }));
app.get('*', (_req, res) => res.sendFile(path.join(dirname, 'dist', 'index.html')));
app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;
  const apiError = error instanceof ApiError ? error : null;
  const errorType = (error as { type?: string })?.type;
  const status = apiError?.status || (errorType === 'entity.too.large' ? 413 : errorType === 'entity.parse.failed' ? 400 : 500);
  if (!apiError && status === 500) console.error(JSON.stringify({ level: 'error', requestId: res.getHeader('x-request-id'), path: req.path, message: error instanceof Error ? error.message : 'Unknown error' }));
  res.status(status).json({ success: false, error: { code: apiError?.code || (status === 413 ? 'payload_too_large' : status === 400 ? 'invalid_json' : 'internal_error'), message: apiError?.message || (status === 413 ? 'Request payload is too large.' : status === 400 ? 'Request body contains invalid JSON.' : 'An unexpected server error occurred.') } });
});

function parseAllowedOrigins(value: string): Set<string> {
  const origins = new Set<string>();
  for (const candidate of value.split(',').map((item) => item.trim()).filter(Boolean)) {
    let url: URL;
    try { url = new URL(candidate); } catch { throw new Error(`Invalid ALLOWED_ORIGINS entry: ${candidate}`); }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== candidate || url.username || url.password) {
      throw new Error(`ALLOWED_ORIGINS must contain exact http(s) origins without paths: ${candidate}`);
    }
    origins.add(url.origin);
  }
  return origins;
}

let server: ReturnType<typeof app.listen> | undefined;
async function start() {
  await store.init();
  server = app.listen(port, '0.0.0.0', () => console.log(JSON.stringify({ level: 'info', message: 'ESCAPE API listening', port, environment: process.env.NODE_ENV || 'development' })));
}

async function shutdown(signal: string) {
  console.log(JSON.stringify({ level: 'info', message: 'Graceful shutdown started', signal }));
  if (!server) return process.exit(0);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
void start().catch((error) => {
  console.error(JSON.stringify({ level: 'error', message: 'Server startup failed', detail: error instanceof Error ? error.message : String(error) }));
  process.exitCode = 1;
});
