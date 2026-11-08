import { Router, Request, Response, NextFunction } from 'express';
import { createSessionToken, verifySessionToken } from './sessionToken';
import {
  createGuestPlayer,
  getPlayerById,
  updateProfile,
  updateSettings,
  getSave,
  updateSave,
  deletePlayer,
  type PlayerRecord,
} from './playerStore';

export const apiRouter = Router();

const MAX_SAVE_BYTES = 200 * 1024;
const SESSION_HEADER = 'authorization';

function getTokenFromRequest(req: Request): string | null {
  const header = req.headers[SESSION_HEADER];
  if (typeof header === 'string') {
    const normalized = header.trim();
    if (normalized.toLowerCase().startsWith('bearer ')) {
      return normalized.slice(7).trim();
    }
    return normalized;
  }

  const altHeader = req.headers['x-session-token'];
  return typeof altHeader === 'string' ? altHeader.trim() : null;
}

function sanitizeString(value: unknown, field: string, maxLength = 64): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) return null;
  if (/\s{2,}/.test(trimmed)) return null;
  return trimmed;
}

function isHexColor(value: unknown): boolean {
  return typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value);
}

function isValidNumber(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function requireSession(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  (req as any).session = payload;
  next();
}

function assertPlayerAccess(req: Request, res: Response, playerId: string): boolean {
  const session = (req as any).session as { playerId: string } | undefined;
  if (!session) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }

  if (session.playerId !== playerId) {
    res.status(403).json({ error: 'Forbidden: player data access denied' });
    return false;
  }

  return true;
}

function validateSavePayload(data: unknown): { valid: boolean; error?: string; payload?: Record<string, unknown> } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Save payload must be an object.' };
  }

  const payload = data as Record<string, unknown>;
  const serialized = JSON.stringify(payload);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_SAVE_BYTES) {
    return { valid: false, error: 'Save payload exceeds the maximum supported size.' };
  }

  if (!payload.quest || typeof payload.quest !== 'object') {
    return { valid: false, error: 'Save payload missing quest state.' };
  }

  if (!payload.playerPos || typeof payload.playerPos !== 'object') {
    return { valid: false, error: 'Save payload missing player position.' };
  }

  const position = payload.playerPos as Record<string, unknown>;
  const hasValidPos = ['x', 'y', 'z'].every((axis) => typeof position[axis] === 'number' && Number.isFinite(position[axis]));
  if (!hasValidPos) {
    return { valid: false, error: 'Player position must include numeric x, y, and z values.' };
  }

  if (typeof payload.savedAt !== 'number' || !Number.isFinite(payload.savedAt)) {
    return { valid: false, error: 'Save payload missing valid savedAt timestamp.' };
  }

  return { valid: true, payload };
}

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Escape Adventure 3D API Server',
    apiVersion: '1.0.0-phase1-secure',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.post('/auth/guest', (req: Request, res: Response) => {
  try {
    const displayName = sanitizeString(req.body?.displayName, 'displayName', 48) || 'Explorer';
    const guestPlayer = createGuestPlayer(displayName);
    const token = createSessionToken(guestPlayer.id);

    res.status(201).json({
      success: true,
      token,
      player: {
        id: guestPlayer.id,
        username: guestPlayer.username,
        displayName: guestPlayer.profile.name,
        createdAt: guestPlayer.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Unable to create guest session' });
  }
});

apiRouter.get('/players/me', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  const player = getPlayerById(session.playerId);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json({ success: true, player: { id: player.id, username: player.username, createdAt: player.createdAt, updatedAt: player.updatedAt } });
});

apiRouter.get('/profiles/me', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  const player = getPlayerById(session.playerId);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json({ success: true, profile: player.profile });
});

apiRouter.put('/profiles/me', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  if (!assertPlayerAccess(req, res, session.playerId)) return;

  const profile = req.body && typeof req.body === 'object' ? req.body : {};
  const safeName = sanitizeString(profile.name, 'name', 48) || undefined;
  const safeTitle = sanitizeString(profile.title, 'title', 48) || undefined;
  const safeTunicColor = isHexColor(profile.tunicColor) ? String(profile.tunicColor) : undefined;
  const safeHatColor = isHexColor(profile.hatColor) ? String(profile.hatColor) : undefined;

  if (safeName === undefined && safeTitle === undefined && safeTunicColor === undefined && safeHatColor === undefined) {
    res.status(400).json({ error: 'Profile updates must include valid name, title, tunicColor, or hatColor values.' });
    return;
  }

  const updated = updateProfile(session.playerId, {
    ...(safeName ? { name: safeName } : {}),
    ...(safeTitle ? { title: safeTitle } : {}),
    ...(safeTunicColor ? { tunicColor: safeTunicColor } : {}),
    ...(safeHatColor ? { hatColor: safeHatColor } : {}),
  });

  if (!updated) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json({ success: true, profile: updated.profile });
});

apiRouter.get('/settings/me', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  const player = getPlayerById(session.playerId);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json({ success: true, settings: player.settings });
});

apiRouter.put('/settings/me', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  if (!assertPlayerAccess(req, res, session.playerId)) return;

  const settings = req.body && typeof req.body === 'object' ? req.body : {};
  const nextSettings: Record<string, unknown> = {};

  if ('soundEnabled' in settings && typeof settings.soundEnabled === 'boolean') nextSettings.soundEnabled = settings.soundEnabled;
  if ('graphicsQuality' in settings && (settings.graphicsQuality === 'low' || settings.graphicsQuality === 'medium' || settings.graphicsQuality === 'high')) nextSettings.graphicsQuality = settings.graphicsQuality;
  if ('mouseSensitivity' in settings && isValidNumber(settings.mouseSensitivity, 0.1, 3)) nextSettings.mouseSensitivity = settings.mouseSensitivity;
  if ('joystickSensitivity' in settings && isValidNumber(settings.joystickSensitivity, 0.1, 3)) nextSettings.joystickSensitivity = settings.joystickSensitivity;
  if ('invertY' in settings && typeof settings.invertY === 'boolean') nextSettings.invertY = settings.invertY;
  if ('showFps' in settings && typeof settings.showFps === 'boolean') nextSettings.showFps = settings.showFps;
  if ('sfxVolume' in settings && isValidNumber(settings.sfxVolume, 0, 1)) nextSettings.sfxVolume = settings.sfxVolume;
  if ('musicVolume' in settings && isValidNumber(settings.musicVolume, 0, 1)) nextSettings.musicVolume = settings.musicVolume;
  if ('timeOfDay' in settings && typeof settings.timeOfDay === 'string') nextSettings.timeOfDay = settings.timeOfDay;
  if ('weather' in settings && typeof settings.weather === 'string') nextSettings.weather = settings.weather;
  if ('autoDayNight' in settings && typeof settings.autoDayNight === 'boolean') nextSettings.autoDayNight = settings.autoDayNight;

  if (Object.keys(nextSettings).length === 0) {
    res.status(400).json({ error: 'Settings update body is empty or invalid.' });
    return;
  }

  const updated = updateSettings(session.playerId, nextSettings);
  if (!updated) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json({ success: true, settings: updated.settings });
});

apiRouter.get('/saves/me', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  const player = getPlayerById(session.playerId);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json({ success: true, save: player.save });
});

apiRouter.put('/saves/me', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  if (!assertPlayerAccess(req, res, session.playerId)) return;

  const validation = validateSavePayload(req.body);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error || 'Invalid save payload.' });
    return;
  }

  const updated = updateSave(session.playerId, validation.payload!);
  if (!updated) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json({ success: true, save: updated.save, savedAt: updated.save?.savedAt });
});

apiRouter.delete('/players/me', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  if (!assertPlayerAccess(req, res, session.playerId)) return;

  const removed = deletePlayer(session.playerId);
  if (!removed) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.status(200).json({ success: true, deletedPlayerId: session.playerId });
});

apiRouter.get('/players/:id/profile', requireSession, (req: Request, res: Response) => {
  const targetId = String(req.params.id || '');
  if (!assertPlayerAccess(req, res, targetId)) return;

  const player = getPlayerById(targetId);
  if (!player) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.json({ success: true, profile: player.profile });
});

apiRouter.put('/players/:id/profile', requireSession, (req: Request, res: Response) => {
  const targetId = String(req.params.id || '');
  if (!assertPlayerAccess(req, res, targetId)) return;

  const safeName = sanitizeString(req.body?.name, 'name', 48);
  const safeTitle = sanitizeString(req.body?.title, 'title', 48);
  const safeTunicColor = isHexColor(req.body?.tunicColor) ? String(req.body.tunicColor) : undefined;
  const safeHatColor = isHexColor(req.body?.hatColor) ? String(req.body.hatColor) : undefined;

  if (!safeName && !safeTitle && !safeTunicColor && !safeHatColor) {
    res.status(400).json({ error: 'Invalid profile fields.' });
    return;
  }

  const updated = updateProfile(targetId, {
    ...(safeName ? { name: safeName } : {}),
    ...(safeTitle ? { title: safeTitle } : {}),
    ...(safeTunicColor ? { tunicColor: safeTunicColor } : {}),
    ...(safeHatColor ? { hatColor: safeHatColor } : {}),
  });

  if (!updated) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.json({ success: true, profile: updated.profile });
});

apiRouter.get('/players/:id/settings', requireSession, (req: Request, res: Response) => {
  const targetId = String(req.params.id || '');
  if (!assertPlayerAccess(req, res, targetId)) return;

  const player = getPlayerById(targetId);
  if (!player) {
    res.status(404).json({ error: 'Settings not found' });
    return;
  }

  res.json({ success: true, settings: player.settings });
});

apiRouter.put('/players/:id/settings', requireSession, (req: Request, res: Response) => {
  const targetId = String(req.params.id || '');
  if (!assertPlayerAccess(req, res, targetId)) return;

  const settings = req.body && typeof req.body === 'object' ? req.body : {};
  const nextSettings: Record<string, unknown> = {};

  if ('soundEnabled' in settings && typeof settings.soundEnabled === 'boolean') nextSettings.soundEnabled = settings.soundEnabled;
  if ('graphicsQuality' in settings && (settings.graphicsQuality === 'low' || settings.graphicsQuality === 'medium' || settings.graphicsQuality === 'high')) nextSettings.graphicsQuality = settings.graphicsQuality;
  if ('mouseSensitivity' in settings && isValidNumber(settings.mouseSensitivity, 0.1, 3)) nextSettings.mouseSensitivity = settings.mouseSensitivity;
  if ('joystickSensitivity' in settings && isValidNumber(settings.joystickSensitivity, 0.1, 3)) nextSettings.joystickSensitivity = settings.joystickSensitivity;
  if ('invertY' in settings && typeof settings.invertY === 'boolean') nextSettings.invertY = settings.invertY;
  if ('showFps' in settings && typeof settings.showFps === 'boolean') nextSettings.showFps = settings.showFps;
  if ('sfxVolume' in settings && isValidNumber(settings.sfxVolume, 0, 1)) nextSettings.sfxVolume = settings.sfxVolume;
  if ('musicVolume' in settings && isValidNumber(settings.musicVolume, 0, 1)) nextSettings.musicVolume = settings.musicVolume;
  if ('timeOfDay' in settings && typeof settings.timeOfDay === 'string') nextSettings.timeOfDay = settings.timeOfDay;
  if ('weather' in settings && typeof settings.weather === 'string') nextSettings.weather = settings.weather;
  if ('autoDayNight' in settings && typeof settings.autoDayNight === 'boolean') nextSettings.autoDayNight = settings.autoDayNight;

  if (Object.keys(nextSettings).length === 0) {
    res.status(400).json({ error: 'Invalid settings update body.' });
    return;
  }

  const updated = updateSettings(targetId, nextSettings);
  if (!updated) {
    res.status(404).json({ error: 'Settings not found' });
    return;
  }

  res.json({ success: true, settings: updated.settings });
});

apiRouter.get('/players/:id/progress', requireSession, (req: Request, res: Response) => {
  const targetId = String(req.params.id || '');
  if (!assertPlayerAccess(req, res, targetId)) return;

  const player = getPlayerById(targetId);
  if (!player) {
    res.status(404).json({ error: 'Progress not found' });
    return;
  }

  res.json({ success: true, progress: player.save?.quest ?? null });
});

apiRouter.post('/players/:id/progress/save', requireSession, (req: Request, res: Response) => {
  const targetId = String(req.params.id || '');
  if (!assertPlayerAccess(req, res, targetId)) return;

  const validation = validateSavePayload(req.body);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error || 'Invalid save payload.' });
    return;
  }

  const updated = updateSave(targetId, validation.payload!);
  if (!updated) {
    res.status(404).json({ error: 'Progress not found' });
    return;
  }

  res.json({ success: true, progress: updated.save?.quest ?? null, savedAt: updated.save?.savedAt });
});

apiRouter.get('/players/session', requireSession, (req: Request, res: Response) => {
  const session = (req as any).session as { playerId: string };
  const player = getPlayerById(session.playerId);
  if (!player) {
    res.status(404).json({ error: 'Player session not found' });
    return;
  }

  res.json({ success: true, player: { id: player.id, username: player.username, createdAt: player.createdAt } });
});

apiRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON body.' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
});

