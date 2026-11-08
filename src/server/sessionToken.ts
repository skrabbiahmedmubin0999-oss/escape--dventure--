import crypto from 'node:crypto';

const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const isProduction = process.env.NODE_ENV === 'production';
const configuredSecret = process.env.SESSION_SECRET;
if (isProduction && (!configuredSecret || Buffer.byteLength(configuredSecret, 'utf8') < 32)) {
  throw new Error('SESSION_SECRET must be set to a strong secret in production (minimum 32 bytes).');
}
// Do not use a known hard-coded fallback. Development tokens are process-local and expire on restart.
const SESSION_SECRET = configuredSecret || crypto.randomBytes(32).toString('base64url');

export interface SessionTokenPayload {
  playerId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function createSessionToken(playerId: string): string {
  if (typeof playerId !== 'string' || playerId.length === 0 || playerId.length > 128) {
    throw new TypeError('A valid player ID is required to create a session token.');
  }
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    playerId,
    sessionId: crypto.randomUUID(),
    iat: now,
    exp: now + DEFAULT_SESSION_TTL_SECONDS,
  };
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  if (typeof token !== 'string' || token.length === 0 || token.length > 4096) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) return null;
  const [headerSegment, payloadSegment, signature] = parts;

  try {
    const header = JSON.parse(base64UrlDecode(headerSegment));
    if (header?.alg !== 'HS256' || header?.typ !== 'JWT') return null;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(`${headerSegment}.${payloadSegment}`).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as Partial<SessionTokenPayload>;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.playerId !== 'string' || payload.playerId.length === 0 || payload.playerId.length > 128 ||
        typeof payload.sessionId !== 'string' || payload.sessionId.length === 0 ||
        typeof payload.iat !== 'number' || !Number.isSafeInteger(payload.iat) ||
        typeof payload.exp !== 'number' || !Number.isSafeInteger(payload.exp) ||
        payload.iat > now + 60 || payload.exp <= now || payload.exp <= payload.iat ||
        payload.exp - payload.iat > DEFAULT_SESSION_TTL_SECONDS) return null;
    return payload as SessionTokenPayload;
  } catch {
    return null;
  }
}
