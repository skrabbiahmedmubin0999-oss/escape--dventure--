import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
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

/** A durable single-process JSON store. Operations are serialized and files are atomically replaced. */
export class PlayerStore {
  private data: DatabaseFile = { schemaVersion: 1, players: {} };
  private initialized = false;
  private queue: Promise<void> = Promise.resolve();
  private readonly filePath: string;

  constructor(dataDirectory = path.resolve(process.env.DATA_DIR || '.data')) {
    this.filePath = path.join(dataDirectory, 'escape-data.json');
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const parsed = JSON.parse(await readFile(this.filePath, 'utf8')) as DatabaseFile;
      if (parsed?.schemaVersion !== 1 || !parsed.players || typeof parsed.players !== 'object' || Array.isArray(parsed.players)) {
        throw new Error('Unsupported or invalid database file schema');
      }
      this.data = parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Could not load player data safely: ${(error as Error).message}`);
      }
    }
    this.initialized = true;
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
      const result = operation();
      await this.persist();
      return structuredClone(result);
    });
    this.queue = pending.then(() => undefined, () => undefined);
    return pending;
  }

  private async persist(): Promise<void> {
    const tempPath = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(tempPath, JSON.stringify(this.data), { encoding: 'utf8', mode: 0o600 });
    await rename(tempPath, this.filePath);
  }
}
