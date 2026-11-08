import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 30;
const MIN_SECRET_LENGTH = 32;
const MAX_TOKEN_LENGTH = 512;

export interface TokenClaims {
  sub: string;
  exp: number;
}

export function createSessionToken(playerId: string, secret: string, now = Date.now()): string {
  assertSecret(secret);
  if (!playerId || playerId.length > 128) throw new Error('Invalid player identifier.');
  const claims: TokenClaims = { sub: playerId, exp: Math.floor(now / 1000) + TOKEN_LIFETIME_SECONDS };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string, secret: string, now = Date.now()): TokenClaims | null {
  if (typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH) return null;
  try {
    assertSecret(secret);
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!payload || !signature || !/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;
    const expected = sign(payload, secret);
    const actualBytes = Buffer.from(signature, 'base64url');
    const expectedBytes = Buffer.from(expected, 'base64url');
    if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    const claims = JSON.parse(decoded) as Partial<TokenClaims>;
    const currentTime = Math.floor(now / 1000);
    if (typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128) return null;
    if (!Number.isSafeInteger(claims.exp) || (claims.exp as number) <= currentTime) return null;
    if ((claims.exp as number) > currentTime + TOKEN_LIFETIME_SECONDS + 60) return null;
    return { sub: claims.sub, exp: claims.exp as number };
  } catch {
    return null;
  }
}

export function createDevelopmentSecret(): string {
  return randomBytes(32).toString('hex');
}

function assertSecret(secret: string): void {
  if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < MIN_SECRET_LENGTH) {
    throw new Error(`Session secret must contain at least ${MIN_SECRET_LENGTH} bytes.`);
  }
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}
