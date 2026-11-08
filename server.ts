import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/apiRouter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const developmentOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
];

function parseConfiguredOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.origin !== value || (isProduction && parsed.protocol !== 'https:')) {
      throw new Error('CORS_ORIGIN must be an exact origin; production origins must use HTTPS.');
    }
    return parsed.origin;
  } catch {
    throw new Error('CORS_ORIGIN must be a valid exact origin URL.');
  }
}

const allowedOrigins = new Set(isProduction ? [] : developmentOrigins);
const configuredOrigin = parseConfiguredOrigin(process.env.CORS_ORIGIN);
if (configuredOrigin) allowedOrigins.add(configuredOrigin);

const sessionSecret = process.env.SESSION_SECRET || '';
if (isProduction && Buffer.byteLength(sessionSecret, 'utf8') < 32) {
  throw new Error('SESSION_SECRET must be set to a strong secret in production (minimum 32 bytes).');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }
  if (origin) res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use('/api/v1', apiRouter);
// Unknown API routes must not fall through to the SPA's index.html.
app.use('/api/v1', (_req, res) => res.status(404).json({ error: 'API route not found' }));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

// Keep error handling last so parser errors (including malformed/oversized JSON) are normalized.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const rawStatus = Number(err?.statusCode ?? err?.status);
  const status = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus < 500 ? rawStatus : 500;
  let message = 'Internal server error';
  if (status === 400) message = 'Malformed JSON body.';
  if (status === 413 || err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body too large.' });
    return;
  }
  res.status(status).json({ error: status < 500 ? message : 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => console.log(`Server listening on 0.0.0.0:${port}`));
