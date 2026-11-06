/**
 * Escape Adventure 3D — Database Schema & Data Models (Phase 1 Specification)
 *
 * Designed for Relational SQL (PostgreSQL / Cloud SQL) and document-oriented persistence.
 */

export interface PlayerRecord {
  id: string; // Primary Key (UUID v4)
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileRecord {
  id: string; // Primary Key (UUID v4)
  playerId: string; // Foreign Key -> PlayerRecord.id
  name: string;
  title: string;
  tunicColor: string;
  hatColor: string;
  updatedAt: string;
}

export interface PlayerStatsRecord {
  id: string; // Primary Key
  playerId: string; // Foreign Key -> PlayerRecord.id
  bestTime: number | null; // Seconds
  totalKeysCollected: number;
  gamesCompleted: number;
  puzzlesSolved: number;
  totalCoins: number;
  totalChests: number;
  xp: number;
  level: number;
  updatedAt: string;
}

export interface QuestProgressRecord {
  id: string; // Primary Key
  playerId: string; // Foreign Key -> PlayerRecord.id
  currentMissionId: string;
  keysCollectedSun: boolean;
  keysCollectedOcean: boolean;
  keysCollectedForest: boolean;
  keysCount: number;
  altarActivated: boolean;
  gateUnlocked: boolean;
  gateOpening: boolean;
  gateOpenProgress: number;
  timeElapsed: number;
  coinsCollected: number;
  chestsOpened: number;
  totalChests: number;
  xpEarned: number;
  puzzlesSolvedCount: number;
  crystalsCollected: number;
  checkpointsReached: number;
  survivalTimeRemaining: number;
  caughtCount: number;
  missionPhase: 'orient' | 'execute' | 'escape' | 'resolve';
  sessionSeed: number;
  firearmAuthorized: boolean;
  ammoCount: number;
  maxAmmo: number;
  playerHealth: number;
  maxPlayerHealth: number;
  updatedAt: string;
}

export interface InventoryItemRecord {
  id: string; // Primary Key
  playerId: string; // Foreign Key -> PlayerRecord.id
  itemType: 'key' | 'crystal' | 'weapon' | 'ammo' | 'tool' | 'chest_loot';
  itemId: string;
  name: string;
  quantity: number;
  acquiredAt: string;
}

export interface AchievementRecord {
  id: string; // Primary Key
  playerId: string; // Foreign Key -> PlayerRecord.id
  achievementId: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardCoins: number;
  rewardXp: number;
  unlockedAt: string | null;
}

export interface SettingsRecord {
  id: string; // Primary Key
  playerId: string; // Foreign Key -> PlayerRecord.id
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

/**
 * SQL DDL Statements for PostgreSQL / Cloud SQL Migration Initialization
 */
export const PG_TABLES_INIT_SQL = `
-- 1. Players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL,
  title VARCHAR(64) NOT NULL,
  tunic_color VARCHAR(16) NOT NULL,
  hat_color VARCHAR(16) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Player Stats
CREATE TABLE IF NOT EXISTS player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID UNIQUE NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  best_time REAL,
  total_keys_collected INT NOT NULL DEFAULT 0,
  games_completed INT NOT NULL DEFAULT 0,
  puzzles_solved INT NOT NULL DEFAULT 0,
  total_coins INT NOT NULL DEFAULT 0,
  total_chests INT NOT NULL DEFAULT 0,
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Quest Progress
CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID UNIQUE NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  current_mission_id VARCHAR(64) NOT NULL DEFAULT 'mission_shadow_escape',
  keys_collected_sun BOOLEAN NOT NULL DEFAULT FALSE,
  keys_collected_ocean BOOLEAN NOT NULL DEFAULT FALSE,
  keys_collected_forest BOOLEAN NOT NULL DEFAULT FALSE,
  keys_count INT NOT NULL DEFAULT 0,
  altar_activated BOOLEAN NOT NULL DEFAULT FALSE,
  gate_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  gate_opening BOOLEAN NOT NULL DEFAULT FALSE,
  gate_open_progress REAL NOT NULL DEFAULT 0,
  time_elapsed REAL NOT NULL DEFAULT 0,
  coins_collected INT NOT NULL DEFAULT 0,
  chests_opened INT NOT NULL DEFAULT 0,
  total_chests INT NOT NULL DEFAULT 6,
  xp_earned INT NOT NULL DEFAULT 0,
  puzzles_solved_count INT NOT NULL DEFAULT 0,
  crystals_collected INT NOT NULL DEFAULT 0,
  checkpoints_reached INT NOT NULL DEFAULT 0,
  survival_time_remaining REAL NOT NULL DEFAULT 240,
  caught_count INT NOT NULL DEFAULT 0,
  mission_phase VARCHAR(32) NOT NULL DEFAULT 'orient',
  session_seed INT NOT NULL DEFAULT 104729,
  firearm_authorized BOOLEAN NOT NULL DEFAULT FALSE,
  ammo_count INT NOT NULL DEFAULT 0,
  max_ammo INT NOT NULL DEFAULT 0,
  player_health INT NOT NULL DEFAULT 100,
  max_player_health INT NOT NULL DEFAULT 100,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  item_type VARCHAR(32) NOT NULL,
  item_id VARCHAR(64) NOT NULL,
  name VARCHAR(64) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_id VARCHAR(64) NOT NULL,
  title VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  progress INT NOT NULL DEFAULT 0,
  max_progress INT NOT NULL DEFAULT 1,
  reward_coins INT NOT NULL DEFAULT 0,
  reward_xp INT NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(player_id, achievement_id)
);

-- 7. Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID UNIQUE NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sfx_volume REAL NOT NULL DEFAULT 0.8,
  music_volume REAL NOT NULL DEFAULT 0.5,
  graphics_quality VARCHAR(16) NOT NULL DEFAULT 'high',
  mouse_sensitivity REAL NOT NULL DEFAULT 1.0,
  joystick_sensitivity REAL NOT NULL DEFAULT 1.0,
  invert_y BOOLEAN NOT NULL DEFAULT FALSE,
  show_fps BOOLEAN NOT NULL DEFAULT FALSE,
  time_of_day VARCHAR(16) NOT NULL DEFAULT 'day',
  weather VARCHAR(16) NOT NULL DEFAULT 'clear',
  auto_day_night BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
