import crypto from 'node:crypto';

const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const SESSION_SECRET = process.env.SESSION_SECRET || 'escape-adventure-development-secret-do-not-use-in-production';

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

function getSignedSecret(): string {
  return crypto.createHash('sha256').update(SESSION_SECRET).digest('hex');
}

export function createSessionToken(playerId: string): string {
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
  const signature = crypto.createHmac('sha256', getSignedSecret()).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  if (!token || typeof token !== 'string' || token.length > 4096) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) return null;
  const [headerSegment, payloadSegment, signature] = parts;

  try {
    const header = JSON.parse(base64UrlDecode(headerSegment));
    if (header?.alg !== 'HS256' || header?.typ !== 'JWT') return null;
    const expected = crypto.createHmac('sha256', getSignedSecret()).update(`${headerSegment}.${payloadSegment}`).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as SessionTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.playerId !== 'string' || !payload.playerId || typeof payload.sessionId !== 'string' ||
        typeof payload.iat !== 'number' || typeof payload.exp !== 'number' ||
        payload.iat > now + 60 || payload.exp <= now || payload.exp <= payload.iat ||
        payload.exp - payload.iat > DEFAULT_SESSION_TTL_SECONDS) return null;
    return payload;
  } catch {
    return null;
  }
}
