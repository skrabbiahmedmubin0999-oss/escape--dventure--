import { Router, Request, Response } from 'express';
import {
  PlayerRecord,
  ProfileRecord,
  PlayerStatsRecord,
  QuestProgressRecord,
  InventoryItemRecord,
  AchievementRecord,
  SettingsRecord,
} from './schema';

export const apiRouter = Router();

// In-Memory Data Store Mock Drivers (Phase 1 Backend Specification)
const playersStore: Map<string, PlayerRecord> = new Map();
const profilesStore: Map<string, ProfileRecord> = new Map();
const statsStore: Map<string, PlayerStatsRecord> = new Map();
const questProgressStore: Map<string, QuestProgressRecord> = new Map();
const inventoryStore: Map<string, InventoryItemRecord[]> = new Map();
const achievementsStore: Map<string, AchievementRecord[]> = new Map();
const settingsStore: Map<string, SettingsRecord> = new Map();

// Helper: Seed Default Player Session
const DEFAULT_PLAYER_ID = 'p_explorer_guest_01';

if (!playersStore.has(DEFAULT_PLAYER_ID)) {
  const now = new Date().toISOString();
  playersStore.set(DEFAULT_PLAYER_ID, {
    id: DEFAULT_PLAYER_ID,
    username: 'Alex The Explorer',
    createdAt: now,
    updatedAt: now,
  });

  profilesStore.set(DEFAULT_PLAYER_ID, {
    id: 'prof_01',
    playerId: DEFAULT_PLAYER_ID,
    name: 'Alex The Explorer',
    title: 'Island Quest Pioneer',
    tunicColor: '#e67e22',
    hatColor: '#8e44ad',
    updatedAt: now,
  });

  statsStore.set(DEFAULT_PLAYER_ID, {
    id: 'stat_01',
    playerId: DEFAULT_PLAYER_ID,
    bestTime: null,
    totalKeysCollected: 0,
    gamesCompleted: 0,
    puzzlesSolved: 0,
    totalCoins: 0,
    totalChests: 0,
    xp: 0,
    level: 1,
    updatedAt: now,
  });

  questProgressStore.set(DEFAULT_PLAYER_ID, {
    id: 'quest_01',
    playerId: DEFAULT_PLAYER_ID,
    currentMissionId: 'mission_shadow_escape',
    keysCollectedSun: false,
    keysCollectedOcean: false,
    keysCollectedForest: false,
    keysCount: 0,
    altarActivated: false,
    gateUnlocked: false,
    gateOpening: false,
    gateOpenProgress: 0,
    timeElapsed: 0,
    coinsCollected: 0,
    chestsOpened: 0,
    totalChests: 6,
    xpEarned: 0,
    puzzlesSolvedCount: 0,
    crystalsCollected: 0,
    checkpointsReached: 0,
    survivalTimeRemaining: 240,
    caughtCount: 0,
    missionPhase: 'orient',
    sessionSeed: 104729,
    firearmAuthorized: false,
    ammoCount: 0,
    maxAmmo: 0,
    playerHealth: 100,
    maxPlayerHealth: 100,
    updatedAt: now,
  });

  settingsStore.set(DEFAULT_PLAYER_ID, {
    id: 'set_01',
    playerId: DEFAULT_PLAYER_ID,
    soundEnabled: true,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    graphicsQuality: 'high',
    mouseSensitivity: 1.0,
    joystickSensitivity: 1.0,
    invertY: false,
    showFps: false,
    timeOfDay: 'day',
    weather: 'clear',
    autoDayNight: false,
    updatedAt: now,
  });
}

// =======================================================
// REST API ENDPOINTS (Phase 1 Architecture Specification)
// =======================================================

// Health Endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Escape Adventure 3D API Server',
    apiVersion: '1.0.0-phase1',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/v1/players/session - Register/Retrieve Guest Player
apiRouter.get('/players/session', (_req: Request, res: Response) => {
  const player = playersStore.get(DEFAULT_PLAYER_ID);
  res.json({ success: true, player });
});

// GET /api/v1/players/:id/profile - Fetch Profile
apiRouter.get('/players/:id/profile', (req: Request, res: Response) => {
  const playerId = req.params.id || DEFAULT_PLAYER_ID;
  const profile = profilesStore.get(playerId) || profilesStore.get(DEFAULT_PLAYER_ID);
  res.json({ success: true, profile });
});

// PUT /api/v1/players/:id/profile - Update Profile
apiRouter.put('/players/:id/profile', (req: Request, res: Response) => {
  const playerId = req.params.id || DEFAULT_PLAYER_ID;
  const current = profilesStore.get(playerId) || {
    id: `prof_${Date.now()}`,
    playerId,
    name: 'Alex The Explorer',
    title: 'Island Quest Pioneer',
    tunicColor: '#e67e22',
    hatColor: '#8e44ad',
    updatedAt: new Date().toISOString(),
  };

  const updated: ProfileRecord = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  profilesStore.set(playerId, updated);
  res.json({ success: true, profile: updated });
});

// GET /api/v1/players/:id/progress - Fetch Quest Progress
apiRouter.get('/players/:id/progress', (req: Request, res: Response) => {
  const playerId = req.params.id || DEFAULT_PLAYER_ID;
  const progress = questProgressStore.get(playerId) || questProgressStore.get(DEFAULT_PLAYER_ID);
  res.json({ success: true, progress });
});

// POST /api/v1/players/:id/progress/save - Save Quest Checkpoint Progress
apiRouter.post('/players/:id/progress/save', (req: Request, res: Response) => {
  const playerId = req.params.id || DEFAULT_PLAYER_ID;
  const current = questProgressStore.get(playerId) || questProgressStore.get(DEFAULT_PLAYER_ID)!;

  const updated: QuestProgressRecord = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  questProgressStore.set(playerId, updated);
  res.json({ success: true, progress: updated, savedAt: updated.updatedAt });
});

// GET /api/v1/players/:id/settings - Fetch Settings
apiRouter.get('/players/:id/settings', (req: Request, res: Response) => {
  const playerId = req.params.id || DEFAULT_PLAYER_ID;
  const settings = settingsStore.get(playerId) || settingsStore.get(DEFAULT_PLAYER_ID);
  res.json({ success: true, settings });
});

// PUT /api/v1/players/:id/settings - Update Settings
apiRouter.put('/players/:id/settings', (req: Request, res: Response) => {
  const playerId = req.params.id || DEFAULT_PLAYER_ID;
  const current = settingsStore.get(playerId) || settingsStore.get(DEFAULT_PLAYER_ID)!;

  const updated: SettingsRecord = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  settingsStore.set(playerId, updated);
  res.json({ success: true, settings: updated });
});
