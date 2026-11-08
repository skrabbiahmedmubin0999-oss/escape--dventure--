import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface ProfileRecord {
  name: string;
  title: string;
  tunicColor: string;
  hatColor: string;
  updatedAt: string;
}
export interface SettingsRecord {
  soundEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  mouseSensitivity: number;
  joystickSensitivity: number;
  invertY: boolean;
  showFps: boolean;
  timeOfDay: string;
  weather: string;
  autoDayNight: boolean;
  updatedAt: string;
}
export interface SavePayload {
  quest: Record<string, unknown>;
  playerPos: { x: number; y: number; z: number };
  savedAt: number;
}
export interface PlayerRecord {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  profile: ProfileRecord;
  settings: SettingsRecord;
  save: SavePayload | null;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'players.json');
function ensureDirectory(): void { fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 }); }

function readStore(): Record<string, PlayerRecord> {
  ensureDirectory();
  if (!fs.existsSync(STORE_FILE)) return {};
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    if (!raw.trim()) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid player store format');
    return parsed as Record<string, PlayerRecord>;
  } catch (error) {
    // Fail closed rather than replacing a corrupt store with an empty store and losing player data.
    throw new Error(`Player store is unreadable; preserve ${STORE_FILE} for recovery.`, { cause: error });
  }
}

function writeStore(store: Record<string, PlayerRecord>): void {
  ensureDirectory();
  const tempFile = `${STORE_FILE}.tmp-${process.pid}-${crypto.randomUUID()}`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), { mode: 0o600, flag: 'wx' });
    fs.renameSync(tempFile, STORE_FILE);
    try { fs.chmodSync(STORE_FILE, 0o600); } catch { /* permissions may be managed by the host */ }
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

function defaultSettings(now: string): SettingsRecord {
  return { soundEnabled: true, sfxVolume: 0.8, musicVolume: 0.5, graphicsQuality: 'high', mouseSensitivity: 1,
    joystickSensitivity: 1, invertY: false, showFps: false, timeOfDay: 'day', weather: 'clear', autoDayNight: false, updatedAt: now };
}
function defaultProfile(name: string, now: string): ProfileRecord {
  return { name, title: 'Island Quest Pioneer', tunicColor: '#e67e22', hatColor: '#8e44ad', updatedAt: now };
}

export function createGuestPlayer(displayName = 'Explorer'): PlayerRecord {
  const now = new Date().toISOString();
  const id = `guest_${crypto.randomUUID().replace(/-/g, '')}`;
  const player: PlayerRecord = {
    id,
    username: displayName.toLowerCase().replace(/[^a-z0-9_]/gi, '').slice(0, 24) || 'explorer',
    createdAt: now, updatedAt: now, profile: defaultProfile(displayName, now), settings: defaultSettings(now), save: null,
  };
  const store = readStore();
  store[player.id] = player;
  writeStore(store);
  return player;
}
export function getPlayerById(playerId: string): PlayerRecord | null { return readStore()[playerId] ?? null; }
export function updateProfile(playerId: string, patch: Partial<ProfileRecord>): PlayerRecord | null {
  const store = readStore(); const player = store[playerId]; if (!player) return null;
  player.profile = { ...player.profile, ...patch, updatedAt: new Date().toISOString() };
  player.updatedAt = player.profile.updatedAt; writeStore(store); return player;
}
export function updateSettings(playerId: string, patch: Partial<SettingsRecord>): PlayerRecord | null {
  const store = readStore(); const player = store[playerId]; if (!player) return null;
  player.settings = { ...player.settings, ...patch, updatedAt: new Date().toISOString() };
  player.updatedAt = player.settings.updatedAt; writeStore(store); return player;
}
export function updateSave(playerId: string, payload: SavePayload): PlayerRecord | null {
  const store = readStore(); const player = store[playerId]; if (!player) return null;
  player.save = { ...payload }; player.updatedAt = new Date().toISOString(); writeStore(store); return player;
}
export function deletePlayer(playerId: string): boolean {
  const store = readStore(); if (!(playerId in store)) return false;
  delete store[playerId]; writeStore(store); return true;
}
export function getSave(playerId: string): SavePayload | null { return getPlayerById(playerId)?.save ?? null; }
export function getPlayerStoreSummary(): { count: number; path: string } { return { count: Object.keys(readStore()).length, path: STORE_FILE }; }
