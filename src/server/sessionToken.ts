import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 30;

export interface TokenClaims {
  sub: string;
  exp: number;
}

export function createSessionToken(playerId: string, secret: string, now = Date.now()): string {
  const claims: TokenClaims = { sub: playerId, exp: Math.floor(now / 1000) + TOKEN_LIFETIME_SECONDS };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string, secret: string, now = Date.now()): TokenClaims | null {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return null;
  const expected = sign(payload, secret);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenClaims;
    if (typeof claims.sub !== 'string' || !claims.sub || !Number.isSafeInteger(claims.exp) || claims.exp <= Math.floor(now / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function createDevelopmentSecret(): string {
  return randomBytes(32).toString('hex');
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}
