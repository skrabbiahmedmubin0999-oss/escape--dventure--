import { NextFunction, Request, Response, Router } from 'express';
import { createSessionToken, verifySessionToken } from './sessionToken';
import { PlayerStore, PlayerSettings, PlayerProfile } from './playerStore';

interface AuthenticatedRequest extends Request {
  playerId?: string;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

const PROFILE_FIELDS = ['name', 'title', 'tunicColor', 'hatColor'] as const;
const SETTING_FIELDS = [
  'soundEnabled', 'sfxVolume', 'musicVolume', 'graphicsQuality', 'mouseSensitivity',
  'joystickSensitivity', 'invertY', 'showFps', 'hapticsEnabled', 'hapticsIntensity',
  'timeOfDay', 'weather', 'autoDayNight',
] as const;

export function createApiRouter(store: PlayerStore, tokenSecret: string): Router {
  const router = Router();

  router.get('/health', (_req, res) => res.json({ success: true, status: 'ok', apiVersion: '1.0.0', timestamp: new Date().toISOString() }));

  router.post('/auth/guest', async (_req, res, next) => {
    try {
      const player = await store.createGuest();
      res.status(201).json({ success: true, player: publicPlayer(player), token: createSessionToken(player.id, tokenSecret) });
    } catch (error) { next(error); }
  });

  router.use(authenticate(store, tokenSecret));

  router.get('/players/me', async (req: AuthenticatedRequest, res, next) => {
    try {
      const player = await store.getPlayer(req.playerId!);
      if (!player) throw new ApiError(401, 'session_expired', 'This guest session is no longer available.');
      res.json({ success: true, player: publicPlayer(player) });
    } catch (error) { next(error); }
  });

  router.get('/profiles/me', async (req: AuthenticatedRequest, res, next) => {
    try {
      const player = await requirePlayer(store, req.playerId!);
      res.json({ success: true, profile: player.profile });
    } catch (error) { next(error); }
  });

  router.put('/profiles/me', async (req: AuthenticatedRequest, res, next) => {
    try {
      const patch = validateProfile(req.body);
      const player = await store.updateProfile(req.playerId!, patch);
      if (!player) throw new ApiError(401, 'session_expired', 'This guest session is no longer available.');
      res.json({ success: true, profile: player.profile });
    } catch (error) { next(error); }
  });

  router.get('/settings/me', async (req: AuthenticatedRequest, res, next) => {
    try {
      const player = await requirePlayer(store, req.playerId!);
      res.json({ success: true, settings: player.settings });
    } catch (error) { next(error); }
  });

  router.put('/settings/me', async (req: AuthenticatedRequest, res, next) => {
    try {
      const patch = validateSettings(req.body);
      const player = await store.updateSettings(req.playerId!, patch);
      if (!player) throw new ApiError(401, 'session_expired', 'This guest session is no longer available.');
      res.json({ success: true, settings: player.settings });
    } catch (error) { next(error); }
  });

  router.get('/saves/me', async (req: AuthenticatedRequest, res, next) => {
    try {
      const player = await requirePlayer(store, req.playerId!);
      res.json({ success: true, save: player.save });
    } catch (error) { next(error); }
  });

  router.put('/saves/me', async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = requireObject(req.body);
      const expectedRevision = body.expectedRevision;
      const save = requireObject(body.save);
      if (!Number.isSafeInteger(expectedRevision) || (expectedRevision as number) < 0) {
        throw new ApiError(400, 'invalid_revision', 'expectedRevision must be a non-negative integer.');
      }
      if (save.version !== 1 || !isPlainObject(save.payload)) {
        throw new ApiError(400, 'invalid_save', 'Save must contain version 1 and a payload object.');
      }
      if (Buffer.byteLength(JSON.stringify(save.payload), 'utf8') > 256 * 1024) {
        throw new ApiError(413, 'save_too_large', 'Save payload exceeds the 256 KB limit.');
      }
      const result = await store.saveGame(req.playerId!, save.payload, expectedRevision as number);
      if (!result.player) throw new ApiError(401, 'session_expired', 'This guest session is no longer available.');
      if (result.conflict) {
        res.status(409).json({ success: false, error: { code: 'save_conflict', message: 'A newer cloud save exists. Fetch it before retrying.', currentRevision: result.player.save?.revision ?? 0 } });
        return;
      }
      res.json({ success: true, save: result.player.save });
    } catch (error) { next(error); }
  });

  router.delete('/players/me', async (req: AuthenticatedRequest, res, next) => {
    try {
      await store.deletePlayer(req.playerId!);
      res.status(204).end();
    } catch (error) { next(error); }
  });

  return router;
}

function authenticate(store: PlayerStore, secret: string) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authorization = req.header('authorization') || '';
    const match = /^Bearer ([A-Za-z0-9._-]{20,512})$/.exec(authorization);
    const claims = match ? verifySessionToken(match[1], secret) : null;
    if (!claims) return next(new ApiError(401, 'unauthorized', 'A valid guest session token is required.'));
    try {
      if (!await store.getPlayer(claims.sub)) return next(new ApiError(401, 'session_expired', 'This guest session is no longer available.'));
      req.playerId = claims.sub;
      next();
    } catch (error) { next(error); }
  };
}

async function requirePlayer(store: PlayerStore, id: string) {
  const player = await store.getPlayer(id);
  if (!player) throw new ApiError(401, 'session_expired', 'This guest session is no longer available.');
  return player;
}

function validateProfile(input: unknown): Partial<PlayerProfile> {
  const body = requireObject(input);
  rejectUnknownFields(body, PROFILE_FIELDS);
  const result: Partial<PlayerProfile> = {};
  for (const field of PROFILE_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== 'string' || value.length > (field === 'name' ? 40 : 64)) throw new ApiError(400, 'invalid_profile', `${field} must be a valid short string.`);
    if ((field === 'tunicColor' || field === 'hatColor') && !/^#[0-9a-fA-F]{6}$/.test(value)) throw new ApiError(400, 'invalid_profile', `${field} must be a hex color.`);
    (result as Record<string, unknown>)[field] = value.trim();
  }
  return result;
}

function validateSettings(input: unknown): Partial<PlayerSettings> {
  const body = requireObject(input);
  rejectUnknownFields(body, SETTING_FIELDS);
  const result: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(body)) {
    if (field === 'soundEnabled' || field === 'invertY' || field === 'showFps' || field === 'hapticsEnabled' || field === 'autoDayNight') {
      if (typeof value !== 'boolean') throw new ApiError(400, 'invalid_settings', `${field} must be boolean.`);
    } else if (field === 'sfxVolume' || field === 'musicVolume') {
      if (typeof value !== 'number' || value < 0 || value > 1) throw new ApiError(400, 'invalid_settings', `${field} must be between 0 and 1.`);
    } else if (field === 'mouseSensitivity' || field === 'joystickSensitivity') {
      if (typeof value !== 'number' || value < 0.1 || value > 5) throw new ApiError(400, 'invalid_settings', `${field} must be between 0.1 and 5.`);
    } else if (field === 'graphicsQuality') {
      if (!['low', 'medium', 'high'].includes(String(value))) throw new ApiError(400, 'invalid_settings', 'graphicsQuality is invalid.');
    } else if (field === 'hapticsIntensity') {
      if (!['low', 'medium', 'high'].includes(String(value))) throw new ApiError(400, 'invalid_settings', 'hapticsIntensity is invalid.');
    } else if (field === 'timeOfDay') {
      if (!['morning', 'day', 'sunset', 'night'].includes(String(value))) throw new ApiError(400, 'invalid_settings', 'timeOfDay is invalid.');
    } else if (field === 'weather') {
      if (!['clear', 'rain', 'wind', 'fog'].includes(String(value))) throw new ApiError(400, 'invalid_settings', 'weather is invalid.');
    }
    result[field] = value;
  }
  return result as Partial<PlayerSettings>;
}

function rejectUnknownFields(body: Record<string, unknown>, allowed: readonly string[]) {
  for (const field of Object.keys(body)) if (!allowed.includes(field)) throw new ApiError(400, 'unknown_field', `Field '${field}' is not allowed.`);
}

function requireObject(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) throw new ApiError(400, 'invalid_body', 'Request body must be a JSON object.');
  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function publicPlayer(player: Awaited<ReturnType<PlayerStore['getPlayer']>>) {
  if (!player) return null;
  return { id: player.id, createdAt: player.createdAt, updatedAt: player.updatedAt };
}
