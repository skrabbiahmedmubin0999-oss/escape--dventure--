import express, { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiRouter, ApiError } from './src/server/apiRouter';
import { PlayerStore } from './src/server/playerStore';
import { createDevelopmentSecret } from './src/server/sessionToken';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const secret = process.env.SESSION_SECRET;
if (isProduction && (!secret || secret.length < 32 || secret.includes('change-me'))) {
  throw new Error('Production requires SESSION_SECRET with at least 32 characters.');
}
const tokenSecret = secret || createDevelopmentSecret();
if (!secret) console.warn(JSON.stringify({ level: 'warn', message: 'SESSION_SECRET is unset; guest sessions will expire when this process restarts.' }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
const store = new PlayerStore();

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use((req, res, next) => {
  const requestId = req.header('x-request-id')?.slice(0, 100) || crypto.randomUUID();
  res.setHeader('x-request-id', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  const origin = req.header('origin');
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(origin && allowedOrigins.includes(origin) ? 204 : 403);
  const startedAt = Date.now();
  res.on('finish', () => console.log(JSON.stringify({ level: 'info', requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt })));
  next();
});

const limits = new Map<string, { count: number; resetAt: number }>();
app.use('/api/v1', (req, res, next) => {
  const now = Date.now();
  const key = `${req.ip}:${req.method === 'POST' && req.path === '/auth/guest' ? 'guest' : 'api'}`;
  let entry = limits.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + 60_000 };
    limits.set(key, entry);
  }
  entry.count += 1;
  const maximum = key.endsWith(':guest') ? 10 : 120;
  res.setHeader('RateLimit-Limit', maximum);
  res.setHeader('RateLimit-Remaining', Math.max(0, maximum - entry.count));
  if (entry.count > maximum) return res.status(429).json({ success: false, error: { code: 'rate_limited', message: 'Too many requests. Try again shortly.' } });
  if (limits.size > 5000) for (const [entryKey, value] of limits) if (value.resetAt <= now) limits.delete(entryKey);
  next();
});
app.use(express.json({ limit: '300kb', strict: true }));
app.use('/api/v1', createApiRouter(store, tokenSecret));
app.use('/api', (_req, res) => res.status(404).json({ success: false, error: { code: 'not_found', message: 'API route not found.' } }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use(express.static(path.join(dirname, 'dist'), { index: false, maxAge: isProduction ? '1h' : 0 }));
app.get('*', (_req, res) => res.sendFile(path.join(dirname, 'dist', 'index.html')));
app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;
  const apiError = error instanceof ApiError ? error : null;
  const status = apiError?.status || ((error as { type?: string })?.type === 'entity.too.large' ? 413 : 500);
  if (!apiError) console.error(JSON.stringify({ level: 'error', requestId: res.getHeader('x-request-id'), path: req.path, message: error instanceof Error ? error.message : 'Unknown error' }));
  res.status(status).json({ success: false, error: { code: apiError?.code || (status === 413 ? 'payload_too_large' : 'internal_error'), message: apiError?.message || (status === 413 ? 'Request payload is too large.' : 'An unexpected server error occurred.') } });
});

let server: ReturnType<typeof app.listen> | undefined;
async function start() {
  await store.init();
  server = app.listen(port, '0.0.0.0', () => console.log(JSON.stringify({ level: 'info', message: 'ESCAPE API listening', port, environment: process.env.NODE_ENV || 'development' })));
}

async function shutdown(signal: string) {
  console.log(JSON.stringify({ level: 'info', message: 'Graceful shutdown started', signal }));
  if (!server) process.exit(0);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
void start().catch((error) => {
  console.error(JSON.stringify({ level: 'error', message: 'Server startup failed', detail: error instanceof Error ? error.message : String(error) }));
  process.exitCode = 1;
});
