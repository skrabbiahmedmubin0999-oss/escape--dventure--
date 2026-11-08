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
  const sessionId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    playerId,
    sessionId,
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
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerSegment, payloadSegment, signature] = parts;
  if (!headerSegment || !payloadSegment || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', getSignedSecret())
    .update(`${headerSegment}.${payloadSegment}`)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as SessionTokenPayload;
    if (!payload.playerId || !payload.sessionId || typeof payload.exp !== 'number') {
      return null;
    }

    if (Math.floor(Date.now() / 1000) >= payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
