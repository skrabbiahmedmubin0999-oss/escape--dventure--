import { randomUUID } from 'node:crypto';
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface PlayerProfile {
  name: string;
  title: string;
  tunicColor: string;
  hatColor: string;
  updatedAt: string;
}

export interface PlayerSettings {
  soundEnabled?: boolean;
  sfxVolume?: number;
  musicVolume?: number;
  graphicsQuality?: 'low' | 'medium' | 'high';
  mouseSensitivity?: number;
  joystickSensitivity?: number;
  invertY?: boolean;
  showFps?: boolean;
  hapticsEnabled?: boolean;
  hapticsIntensity?: 'low' | 'medium' | 'high';
  timeOfDay?: 'morning' | 'day' | 'sunset' | 'night';
  weather?: 'clear' | 'rain' | 'wind' | 'fog';
  autoDayNight?: boolean;
  updatedAt: string;
}

export interface CloudSave {
  version: 1;
  payload: Record<string, unknown>;
  revision: number;
  updatedAt: string;
}

export interface PlayerRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  profile: PlayerProfile;
  settings: PlayerSettings;
  save: CloudSave | null;
}

interface DatabaseFile {
  schemaVersion: 1;
  players: Record<string, PlayerRecord>;
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Explorer',
  title: 'Island Quest Pioneer',
  tunicColor: '#e67e22',
  hatColor: '#8e44ad',
  updatedAt: new Date(0).toISOString(),
};

const DEFAULT_SETTINGS: PlayerSettings = {
  soundEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  graphicsQuality: 'high',
  mouseSensitivity: 1,
  joystickSensitivity: 1,
  invertY: false,
  showFps: false,
  hapticsEnabled: true,
  hapticsIntensity: 'medium',
  timeOfDay: 'day',
  weather: 'clear',
  autoDayNight: false,
  updatedAt: new Date(0).toISOString(),
};

/** Durable, single-process JSON storage. Use a transactional database before running multiple instances. */
export class PlayerStore {
  private data: DatabaseFile = { schemaVersion: 1, players: {} };
  private initialization: Promise<void> | null = null;
  private initialized = false;
  private queue: Promise<void> = Promise.resolve();
  private readonly filePath: string;

  constructor(dataDirectory = path.resolve(process.env.DATA_DIR || '.data')) {
    this.filePath = path.join(path.resolve(dataDirectory), 'escape-data.json');
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initialization) return this.initialization;

    this.initialization = this.loadFromDisk();
    try {
      await this.initialization;
      this.initialized = true;
    } catch (error) {
      this.initialization = null;
      throw error;
    }
  }

  private async loadFromDisk(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
    try {
      const raw = await readFile(this.filePath, 'utf8');
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error('Player data JSON is corrupted; preserve the file and restore a verified backup before restarting.');
      }
      if (!isDatabaseFile(parsed)) {
        throw new Error('Player data has an unsupported or invalid schema; preserve the file and restore a verified backup.');
      }
      this.data = parsed;
      await chmod(this.filePath, 0o600).catch(() => undefined);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
  }

  async createGuest(): Promise<PlayerRecord> {
    return this.mutate(() => {
      const now = new Date().toISOString();
      const player: PlayerRecord = {
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        profile: { ...DEFAULT_PROFILE, updatedAt: now },
        settings: { ...DEFAULT_SETTINGS, updatedAt: now },
        save: null,
      };
      this.data.players[player.id] = player;
      return player;
    });
  }

  async getPlayer(id: string): Promise<PlayerRecord | null> {
    await this.init();
    const player = this.data.players[id];
    return player ? structuredClone(player) : null;
  }

  async updateProfile(id: string, patch: Partial<PlayerProfile>): Promise<PlayerRecord | null> {
    return this.mutate(() => {
      const player = this.data.players[id];
      if (!player) return null;
      const now = new Date().toISOString();
      player.profile = { ...player.profile, ...patch, updatedAt: now };
      player.updatedAt = now;
      return player;
    });
  }

  async updateSettings(id: string, patch: Partial<PlayerSettings>): Promise<PlayerRecord | null> {
    return this.mutate(() => {
      const player = this.data.players[id];
      if (!player) return null;
      const now = new Date().toISOString();
      player.settings = { ...player.settings, ...patch, updatedAt: now };
      player.updatedAt = now;
      return player;
    });
  }

  async saveGame(id: string, payload: Record<string, unknown>, expectedRevision: number): Promise<{ player: PlayerRecord | null; conflict: boolean }> {
    return this.mutate(() => {
      const player = this.data.players[id];
      if (!player) return { player: null, conflict: false };
      const currentRevision = player.save?.revision ?? 0;
      if (expectedRevision !== currentRevision) return { player, conflict: true };
      const now = new Date().toISOString();
      player.save = { version: 1, payload, revision: currentRevision + 1, updatedAt: now };
      player.updatedAt = now;
      return { player, conflict: false };
    });
  }

  async deletePlayer(id: string): Promise<boolean> {
    return this.mutate(() => {
      if (!this.data.players[id]) return false;
      delete this.data.players[id];
      return true;
    });
  }

  private async mutate<T>(operation: () => T): Promise<T> {
    await this.init();
    const pending = this.queue.then(async () => {
      const before = structuredClone(this.data);
      try {
        const result = operation();
        await this.persist();
        return structuredClone(result);
      } catch (error) {
        this.data = before;
        throw error;
      }
    });
    this.queue = pending.then(() => undefined, () => undefined);
    return pending;
  }

  private async persist(): Promise<void> {
    const tempPath = `${this.filePath}.${randomUUID()}.tmp`;
    try {
      await writeFile(tempPath, JSON.stringify(this.data), { encoding: 'utf8', mode: 0o600, flag: 'wx' });
      await rename(tempPath, this.filePath);
      await chmod(this.filePath, 0o600).catch(() => undefined);
    } catch (error) {
      await import('node:fs/promises').then(({ unlink }) => unlink(tempPath)).catch(() => undefined);
      throw error;
    }
  }
}

function isDatabaseFile(value: unknown): value is DatabaseFile {
  if (!isPlainObject(value) || value.schemaVersion !== 1 || !isPlainObject(value.players)) return false;
  return Object.entries(value.players).every(([id, raw]) => {
    if (!isPlainObject(raw) || raw.id !== id || typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string') return false;
    if (!isPlainObject(raw.profile) || !isPlainObject(raw.settings)) return false;
    if (raw.save !== null && (!isPlainObject(raw.save) || raw.save.version !== 1 || !isPlainObject(raw.save.payload) || !Number.isSafeInteger(raw.save.revision) || (raw.save.revision as number) < 1)) return false;
    return true;
  });
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
