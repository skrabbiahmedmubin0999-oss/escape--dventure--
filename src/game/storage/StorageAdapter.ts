import { GameSettings, PlayerCustomization, PlayerStats, QuestProgress, ControlLayoutConfig, DEFAULT_CONTROL_LAYOUT, KeyBindings, DEFAULT_KEY_BINDINGS, AdvancedGraphicsSettings, DEFAULT_ADVANCED_GRAPHICS, HUDProfile, FeatureModuleConfig } from '../types';
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
  loadKeyBindings(): Promise<KeyBindings>;
  saveKeyBindings(bindings: KeyBindings): Promise<void>;
  loadAdvancedGraphics(): Promise<AdvancedGraphicsSettings>;
  saveAdvancedGraphics(graphics: AdvancedGraphicsSettings): Promise<void>;
  loadHUDProfiles(): Promise<HUDProfile[]>;
  saveHUDProfiles(profiles: HUDProfile[]): Promise<void>;
  loadFeatureManagerConfig(): Promise<Record<string, boolean> | null>;
  saveFeatureManagerConfig(config: Record<string, boolean>): Promise<void>;
  exportConfigurationJSON(): Promise<string>;
  importConfigurationJSON(jsonString: string): Promise<{ success: boolean; message: string }>;
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

  async loadKeyBindings(): Promise<KeyBindings> {
    await this.init();
    const bindings = await idbGet<KeyBindings>(STORES.KEY_BINDINGS, 'default');
    return bindings ? { ...DEFAULT_KEY_BINDINGS, ...bindings } : DEFAULT_KEY_BINDINGS;
  }

  async saveKeyBindings(bindings: KeyBindings): Promise<void> {
    await idbSet<KeyBindings>(STORES.KEY_BINDINGS, bindings, 'default');
  }

  async loadAdvancedGraphics(): Promise<AdvancedGraphicsSettings> {
    await this.init();
    const graphics = await idbGet<AdvancedGraphicsSettings>(STORES.SETTINGS, 'advanced_graphics');
    return graphics ? { ...DEFAULT_ADVANCED_GRAPHICS, ...graphics } : DEFAULT_ADVANCED_GRAPHICS;
  }

  async saveAdvancedGraphics(graphics: AdvancedGraphicsSettings): Promise<void> {
    await idbSet<AdvancedGraphicsSettings>(STORES.SETTINGS, graphics, 'advanced_graphics');
  }

  async loadHUDProfiles(): Promise<HUDProfile[]> {
    await this.init();
    const profiles = await idbGet<HUDProfile[]>(STORES.HUD_PROFILES, 'default_list');
    return Array.isArray(profiles) && profiles.length > 0 ? profiles : [
      { id: 'default', name: 'Default Mobile', presetType: 'default', layout: DEFAULT_CONTROL_LAYOUT }
    ];
  }

  async saveHUDProfiles(profiles: HUDProfile[]): Promise<void> {
    await idbSet<HUDProfile[]>(STORES.HUD_PROFILES, profiles, 'default_list');
  }

  async loadFeatureManagerConfig(): Promise<Record<string, boolean> | null> {
    await this.init();
    return await idbGet<Record<string, boolean>>(STORES.FEATURE_MANAGER, 'default');
  }

  async saveFeatureManagerConfig(config: Record<string, boolean>): Promise<void> {
    await idbSet<Record<string, boolean>>(STORES.FEATURE_MANAGER, config, 'default');
  }

  async exportConfigurationJSON(): Promise<string> {
    await this.init();
    const [settings, keyBindings, graphics, layout, profiles, features] = await Promise.all([
      this.loadSettings(),
      this.loadKeyBindings(),
      this.loadAdvancedGraphics(),
      this.loadControlLayout(),
      this.loadHUDProfiles(),
      this.loadFeatureManagerConfig(),
    ]);

    const exportBundle = {
      app: 'ESCAPE_ADVENTURE_3D',
      version: '4.8.0',
      exportedAt: Date.now(),
      settings,
      keyBindings,
      graphics,
      layout,
      profiles,
      features,
    };

    return JSON.stringify(exportBundle, null, 2);
  }

  async importConfigurationJSON(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || parsed.app !== 'ESCAPE_ADVENTURE_3D') {
        return { success: false, message: 'Invalid configuration file signature.' };
      }

      if (parsed.settings) await this.saveSettings(parsed.settings);
      if (parsed.keyBindings) await this.saveKeyBindings(parsed.keyBindings);
      if (parsed.graphics) await this.saveAdvancedGraphics(parsed.graphics);
      if (parsed.layout) await this.saveControlLayout(parsed.layout);
      if (parsed.profiles) await this.saveHUDProfiles(parsed.profiles);
      if (parsed.features) await this.saveFeatureManagerConfig(parsed.features);

      return { success: true, message: 'Configuration profile imported successfully!' };
    } catch (err: any) {
      return { success: false, message: `JSON Import Error: ${err?.message || 'Syntax error'}` };
    }
  }
}

// Global Singleton Storage Manager
export const offlineStorage: StorageAdapter = new OfflineIndexedDBAdapter();
