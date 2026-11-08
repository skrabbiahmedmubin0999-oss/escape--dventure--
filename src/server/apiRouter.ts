import { Router, Request, Response, NextFunction } from 'express';
import { createSessionToken, verifySessionToken } from './sessionToken';
import { createGuestPlayer, getPlayerById, updateProfile, updateSettings, updateSave, deletePlayer } from './playerStore';

export const apiRouter = Router();
const MAX_SAVE_BYTES = 200 * 1024;
type Session = { playerId: string };
function sessionOf(req: Request): Session | undefined { return (req as any).session as Session | undefined; }
function getToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (typeof auth === 'string') {
    const value = auth.trim();
    return value.toLowerCase().startsWith('bearer ') ? value.slice(7).trim() : value;
  }
  const alternate = req.headers['x-session-token'];
  return typeof alternate === 'string' ? alternate.trim() : null;
}
function requireSession(req: Request, res: Response, next: NextFunction): void {
  const token = getToken(req);
  const session = token ? verifySessionToken(token) : null;
  if (!session) { res.status(401).json({ error: token ? 'Invalid or expired session' : 'Authentication required' }); return; }
  (req as any).session = session;
  next();
}
function canAccess(req: Request, res: Response, playerId: string): boolean {
  const session = sessionOf(req);
  if (!session) { res.status(401).json({ error: 'Authentication required' }); return false; }
  if (session.playerId !== playerId) { res.status(403).json({ error: 'Player data access denied' }); return false; }
  return true;
}
function safeString(value: unknown, max = 48): string | null {
  if (typeof value !== 'string') return null;
  const result = value.trim();
  return result.length > 0 && result.length <= max && !/[\u0000-\u001f]/.test(result) ? result : null;
}
function color(value: unknown): string | undefined { return typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : undefined; }
function validNumber(value: unknown, min: number, max: number): value is number { return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max; }
function validateSettings(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const src = input as Record<string, unknown>; const result: Record<string, unknown> = {};
  const bools = ['soundEnabled', 'invertY', 'showFps', 'autoDayNight'];
  for (const key of bools) if (key in src) { if (typeof src[key] !== 'boolean') return null; result[key] = src[key]; }
  for (const key of ['sfxVolume', 'musicVolume']) if (key in src) { if (!validNumber(src[key], 0, 1)) return null; result[key] = src[key]; }
  for (const key of ['mouseSensitivity', 'joystickSensitivity']) if (key in src) { if (!validNumber(src[key], 0.1, 3)) return null; result[key] = src[key]; }
  if ('graphicsQuality' in src) { if (!['low', 'medium', 'high'].includes(String(src.graphicsQuality))) return null; result.graphicsQuality = src.graphicsQuality; }
  for (const key of ['timeOfDay', 'weather']) if (key in src) { const text = safeString(src[key], 24); if (!text) return null; result[key] = text; }
  return Object.keys(result).length ? result : null;
}
function validateSave(input: unknown): { payload?: any; error?: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Save payload must be an object.' };
  let encoded: string;
  try { encoded = JSON.stringify(input); } catch { return { error: 'Invalid save payload.' }; }
  if (Buffer.byteLength(encoded, 'utf8') > MAX_SAVE_BYTES) return { error: 'Save payload exceeds the maximum supported size.' };
  const body = input as Record<string, unknown>;
  if (!body.quest || typeof body.quest !== 'object' || Array.isArray(body.quest)) return { error: 'Save payload missing quest state.' };
  if (!body.playerPos || typeof body.playerPos !== 'object' || Array.isArray(body.playerPos)) return { error: 'Save payload missing player position.' };
  const pos = body.playerPos as Record<string, unknown>;
  if (!['x', 'y', 'z'].every((axis) => validNumber(pos[axis], -1e6, 1e6))) return { error: 'Player position must contain finite x, y, and z values.' };
  if (!validNumber(body.savedAt, 0, Number.MAX_SAFE_INTEGER)) return { error: 'Save payload missing valid savedAt timestamp.' };
  return { payload: body };
}
function profileUpdate(req: Request, res: Response, playerId: string): void {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const patch: Record<string, string> = {};
  for (const key of ['name', 'title'] as const) if (key in body) { const value = safeString(body[key]); if (!value) { res.status(400).json({ error: `Invalid ${key}.` }); return; } patch[key] = value; }
  for (const key of ['tunicColor', 'hatColor'] as const) if (key in body) { const value = color(body[key]); if (!value) { res.status(400).json({ error: `Invalid ${key}.` }); return; } patch[key] = value; }
  if (!Object.keys(patch).length) { res.status(400).json({ error: 'Profile update is empty or invalid.' }); return; }
  const updated = updateProfile(playerId, patch);
  if (!updated) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, profile: updated.profile });
}
function settingsUpdate(req: Request, res: Response, playerId: string): void {
  const patch = validateSettings(req.body);
  if (!patch) { res.status(400).json({ error: 'Settings update is empty or invalid.' }); return; }
  const updated = updateSettings(playerId, patch);
  if (!updated) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, settings: updated.settings });
}

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok', system: 'Escape Adventure 3D API Server', apiVersion: '1.0.0-phase2', timestamp: new Date().toISOString() }));
apiRouter.post('/auth/guest', (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const name = body.displayName === undefined ? 'Explorer' : safeString(body.displayName);
  if (!name) { res.status(400).json({ error: 'Invalid displayName.' }); return; }
  try {
    const player = createGuestPlayer(name); const token = createSessionToken(player.id);
    res.status(201).json({ success: true, token, player: { id: player.id, username: player.username, displayName: player.profile.name, createdAt: player.createdAt } });
  } catch { res.status(500).json({ error: 'Unable to create guest session' }); }
});
apiRouter.get('/players/me', requireSession, (req, res) => {
  const player = getPlayerById(sessionOf(req)!.playerId);
  if (!player) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, player: { id: player.id, username: player.username, createdAt: player.createdAt, updatedAt: player.updatedAt } });
});
apiRouter.get('/profiles/me', requireSession, (req, res) => {
  const player = getPlayerById(sessionOf(req)!.playerId);
  if (!player) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, profile: player.profile });
});
apiRouter.put('/profiles/me', requireSession, (req, res) => profileUpdate(req, res, sessionOf(req)!.playerId));
apiRouter.get('/settings/me', requireSession, (req, res) => {
  const player = getPlayerById(sessionOf(req)!.playerId);
  if (!player) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, settings: player.settings });
});
apiRouter.put('/settings/me', requireSession, (req, res) => settingsUpdate(req, res, sessionOf(req)!.playerId));
apiRouter.get('/saves/me', requireSession, (req, res) => {
  const player = getPlayerById(sessionOf(req)!.playerId);
  if (!player) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, save: player.save });
});
apiRouter.put('/saves/me', requireSession, (req, res) => {
  const playerId = sessionOf(req)!.playerId; const validation = validateSave(req.body);
  if (!validation.payload) { res.status(400).json({ error: validation.error }); return; }
  const updated = updateSave(playerId, validation.payload);
  if (!updated) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, save: updated.save, savedAt: updated.save?.savedAt });
});
apiRouter.delete('/players/me', requireSession, (req, res) => {
  const playerId = sessionOf(req)!.playerId;
  if (!deletePlayer(playerId)) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, deletedPlayerId: playerId });
});

// Compatibility routes remain authenticated and enforce ownership.
apiRouter.get('/players/session', requireSession, (req, res) => {
  const player = getPlayerById(sessionOf(req)!.playerId);
  if (!player) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, player: { id: player.id, username: player.username, createdAt: player.createdAt } });
});
apiRouter.get('/players/:id/profile', requireSession, (req, res) => {
  if (!canAccess(req, res, req.params.id)) return;
  const player = getPlayerById(req.params.id);
  if (!player) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, profile: player.profile });
});
apiRouter.put('/players/:id/profile', requireSession, (req, res) => {
  if (!canAccess(req, res, req.params.id)) return;
  profileUpdate(req, res, req.params.id);
});
apiRouter.get('/players/:id/settings', requireSession, (req, res) => {
  if (!canAccess(req, res, req.params.id)) return;
  const player = getPlayerById(req.params.id);
  if (!player) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, settings: player.settings });
});
apiRouter.put('/players/:id/settings', requireSession, (req, res) => {
  if (!canAccess(req, res, req.params.id)) return;
  settingsUpdate(req, res, req.params.id);
});
apiRouter.get('/players/:id/progress', requireSession, (req, res) => {
  if (!canAccess(req, res, req.params.id)) return;
  const player = getPlayerById(req.params.id);
  if (!player) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, progress: player.save?.quest ?? null });
});
apiRouter.post('/players/:id/progress/save', requireSession, (req, res) => {
  if (!canAccess(req, res, req.params.id)) return;
  const validation = validateSave(req.body);
  if (!validation.payload) { res.status(400).json({ error: validation.error }); return; }
  const updated = updateSave(req.params.id, validation.payload);
  if (!updated) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json({ success: true, progress: updated.save?.quest ?? null, savedAt: updated.save?.savedAt });
});
apiRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) { res.status(400).json({ error: 'Malformed JSON body.' }); return; }
  res.status(err?.type === 'entity.too.large' ? 413 : 500).json({ error: err?.type === 'entity.too.large' ? 'Request body too large.' : 'Internal server error' });
});
