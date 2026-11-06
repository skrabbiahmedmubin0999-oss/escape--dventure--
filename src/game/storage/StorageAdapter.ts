import { GameSettings, PlayerCustomization, PlayerStats, QuestProgress, ControlLayoutConfig, DEFAULT_CONTROL_LAYOUT } from '../types';
import { idbGet, idbSet, STORES, migrateLegacyLocalStorage } from './indexedDB';

export interface SavedGameData {
  quest: QuestProgress;
  playerPos: { x: number; y: number; z: number };
  savedAt: number;
}

export interface StorageAdapter {
  init(): Promise<void>;
  loadSettings(): Promise<GameSettings | null>;
  saveSettings(settings: GameSettings): Promise<void>;
  loadProfile(): Promise<PlayerCustomization | null>;
  saveProfile(profile: PlayerCustomization): Promise<void>;
  loadStats(): Promise<PlayerStats | null>;
  saveStats(stats: PlayerStats): Promise<void>;
  loadSavedGame(): Promise<SavedGameData | null>;
  saveSavedGame(saveData: SavedGameData): Promise<void>;
  loadControlLayout(): Promise<ControlLayoutConfig | null>;
  saveControlLayout(layout: ControlLayoutConfig): Promise<void>;
}

export class OfflineIndexedDBAdapter implements StorageAdapter {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    await migrateLegacyLocalStorage();
    this.initialized = true;
  }

  async loadSettings(): Promise<GameSettings | null> {
    await this.init();
    return await idbGet<GameSettings>(STORES.SETTINGS, 'default');
  }

  async saveSettings(settings: GameSettings): Promise<void> {
    await idbSet<GameSettings>(STORES.SETTINGS, settings, 'default');
  }

  async loadProfile(): Promise<PlayerCustomization | null> {
    await this.init();
    return await idbGet<PlayerCustomization>(STORES.PROFILE, 'default');
  }

  async saveProfile(profile: PlayerCustomization): Promise<void> {
    await idbSet<PlayerCustomization>(STORES.PROFILE, profile, 'default');
  }

  async loadStats(): Promise<PlayerStats | null> {
    await this.init();
    return await idbGet<PlayerStats>(STORES.STATS, 'default');
  }

  async saveStats(stats: PlayerStats): Promise<void> {
    await idbSet<PlayerStats>(STORES.STATS, stats, 'default');
  }

  async loadSavedGame(): Promise<SavedGameData | null> {
    await this.init();
    return await idbGet<SavedGameData>(STORES.SAVED_GAME, 'default');
  }

  async saveSavedGame(saveData: SavedGameData): Promise<void> {
    await idbSet<SavedGameData>(STORES.SAVED_GAME, saveData, 'default');
  }

  async loadControlLayout(): Promise<ControlLayoutConfig | null> {
    await this.init();
    const layout = await idbGet<ControlLayoutConfig>(STORES.CONTROLS_LAYOUT, 'default');
    return layout || DEFAULT_CONTROL_LAYOUT;
  }

  async saveControlLayout(layout: ControlLayoutConfig): Promise<void> {
    await idbSet<ControlLayoutConfig>(STORES.CONTROLS_LAYOUT, layout, 'default');
  }
}

// Global Singleton Storage Manager
export const offlineStorage: StorageAdapter = new OfflineIndexedDBAdapter();
