export type GameMode = 'menu' | 'playing' | 'paused' | 'victory' | 'failure';

export type KeyType = 'sun' | 'ocean' | 'forest';

export type GameMapType =
  | 'mystery_island'
  | 'frozen_mountain'
  | 'lost_desert'
  | 'sky_kingdom'
  | 'ocean_mystery';

export type MultiplayerModeType =
  | 'coop_adventure'
  | 'obstacle_race'
  | 'treasure_hunt'
  | 'survival_challenge'
  | 'team_challenge';

export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night';
export type WeatherType = 'clear' | 'rain' | 'wind' | 'fog';

export interface EnvironmentState {
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  autoCycle: boolean;
  cycleProgress: number; // 0 (morning) -> 0.25 (day) -> 0.5 (sunset) -> 0.75 (night) -> 1.0
}

export interface KeyInfo {
  id: KeyType;
  name: string;
  color: string;
  glowColor: string;
  locationName: string;
  hint: string;
  collected: boolean;
  position: [number, number, number];
}

export interface PlayerCustomization {
  name: string;
  tunicColor: string;
  hatColor: string;
  title: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  mouseSensitivity: number;
  joystickSensitivity?: number;
  invertY: boolean;
  showFps: boolean;
  hapticsEnabled: boolean;
  hapticsIntensity: 'low' | 'medium' | 'high';
  timeOfDay?: TimeOfDay;
  weather?: WeatherType;
  autoDayNight?: boolean;
}

export interface PlayerStats {
  bestTime: number | null; // in seconds
  totalKeysCollected: number;
  gamesCompleted: number;
  puzzlesSolved: number;
  totalCoins: number;
  totalChests: number;
  xp: number;
  level: number;
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  color: string;
  ping: number;
}

export interface MultiplayerRoom {
  roomId: string;
  roomName: string;
  isHost: boolean;
  maxPlayers: number;
  selectedMap: GameMapType;
  selectedMode: MultiplayerModeType;
  players: MultiplayerPlayer[];
  status: 'waiting' | 'in-game';
}

export interface QuestProgress {
  keysCollected: Record<KeyType, boolean>;
  keysCount: number;
  altarActivated: boolean;
  gateUnlocked: boolean;
  gateOpening: boolean;
  gateOpenProgress: number; // 0 to 1
  timeElapsed: number; // in seconds
  coinsCollected: number;
  chestsOpened: number;
  totalChests: number;
  xpEarned: number;
  // Expansion Stage 1-6 features
  puzzlesSolvedCount: number;
  totalPuzzles: number;
  crystalsCollected: number;
  totalCrystals: number;
  checkpointsReached: number;
  totalCheckpoints: number;
  survivalTimeRemaining: number;
  survivalActive: boolean;
  caughtCount: number;
  missionPhase: 'orient' | 'execute' | 'escape' | 'resolve';
  sessionSeed: number;
  stoneCooldown: number;
  // Phase 7 Hybrid Combat features
  currentMissionId?: string;
  firearmAuthorized: boolean;
  ammoCount: number;
  maxAmmo: number;
  playerHealth: number;
  maxPlayerHealth: number;
  attackCooldown: number;
  dodgeCooldown: number;
  isParrying: boolean;
}

// Puzzles
export type PuzzleType = 'symbol_match' | 'switch_sequence' | 'rune_dial';

export interface PuzzleState {
  id: string;
  name: string;
  type: PuzzleType;
  solved: boolean;
  clue: string;
  locationName: string;
  position: [number, number, number];
  // Internal puzzle properties
  symbols?: string[]; // For symbol match: e.g. ['Sun', 'Water', 'Leaf']
  switchesState?: boolean[]; // For switch sequence: e.g. [false, false, false, false]
  dialAngles?: number[]; // For rune dial: e.g. [0, 0, 0]
}

// Obstacle Course & Checkpoints
export interface CheckpointData {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  reached: boolean;
}

export interface ObstacleCourseState {
  active: boolean;
  currentCheckpointIndex: number;
  checkpoints: CheckpointData[];
  startTime: number;
  elapsedTime: number;
  completed: boolean;
  bestTime: number | null;
}

// Survival Missions
export interface SurvivalMissionState {
  active: boolean;
  title: string;
  description: string;
  targetCrystals: number;
  crystalsCollected: number;
  timeLimit: number; // in seconds
  timeRemaining: number; // in seconds
  completed: boolean;
  failed: boolean;
}

// Notifications & Achievements
export interface NotificationToast {
  id: string;
  type: 'coin' | 'xp' | 'chest' | 'puzzle' | 'checkpoint' | 'achievement' | 'survival' | 'key';
  title: string;
  message: string;
  timestamp: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardCoins: number;
  rewardXp: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  objectiveCount: number;
  currentCount: number;
  rewardXp: number;
  completed: boolean;
}

// Co-op & Multiplayer Event Synchronization Ready Interface
export interface NetworkSyncPayload {
  playerId: string;
  position: [number, number, number];
  rotation: number;
  animationState: string;
  questProgress: Partial<QuestProgress>;
  puzzleUpdate?: { puzzleId: string; solved: boolean; stateData: Record<string, unknown> };
  chestUpdate?: { chestId: string; opened: boolean };
  checkpointUpdate?: { checkpointId: string };
  timestamp: number;
}

export interface ControlElementConfig {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  enabled?: boolean;
}

export interface ControlLayoutConfig {
  joystick: ControlElementConfig;
  actionCluster: ControlElementConfig;
  interactButton: ControlElementConfig;
  combatCluster: ControlElementConfig;
  vitalsBar?: ControlElementConfig;
  miniMap?: ControlElementConfig;
  objectiveTracker?: ControlElementConfig;
}

export type GraphicsQualityPreset = 'low' | 'medium' | 'high' | 'ultra' | 'auto';

export interface AdvancedGraphicsSettings {
  qualityPreset: GraphicsQualityPreset;
  renderScale: number; // 0.5 to 1.5
  shadowQuality: 'off' | 'low' | 'medium' | 'high' | 'ultra';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  antiAliasing: 'off' | 'fxaa' | 'msaa';
  ambientOcclusion: 'off' | 'low' | 'high';
  viewDistance: number; // 50 to 250 meters
  effectsQuality: 'low' | 'medium' | 'high';
  postProcessing: boolean;
  vsync: boolean;
  fpsLimit: 30 | 60 | 120 | 0;
  dynamicResolution: boolean;
}

export interface KeyBindings {
  moveForward: string;
  moveBackward: string;
  moveLeft: string;
  moveRight: string;
  sprint: string;
  crouch: string;
  jump: string;
  interact: string;
  attack: string;
  parry: string;
  dodge: string;
  shoot: string;
  throwStone: string;
  openInventory: string;
  openAchievements: string;
  pause: string;
}

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  moveForward: 'KeyW',
  moveBackward: 'KeyS',
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  sprint: 'ShiftLeft',
  crouch: 'KeyC',
  jump: 'Space',
  interact: 'KeyE',
  attack: 'KeyF',
  parry: 'KeyR',
  dodge: 'KeyX',
  shoot: 'KeyG',
  throwStone: 'KeyQ',
  openInventory: 'KeyI',
  openAchievements: 'KeyT',
  pause: 'Escape',
};

export interface HUDProfile {
  id: string;
  name: string;
  presetType: 'default' | 'mobile' | 'desktop' | 'minimal' | 'advanced' | 'custom';
  layout: ControlLayoutConfig;
}

export interface FeatureModuleConfig {
  id: string;
  name: string;
  category: 'Graphics' | 'Performance' | 'Controls' | 'HUD' | 'Gameplay' | 'AI' | 'Audio' | 'Accessibility' | 'Experimental';
  description: string;
  enabled: boolean;
  status: 'active' | 'supported' | 'inactive' | 'failed';
  performanceImpact: 'Zero' | 'Low' | 'Medium' | 'High';
}

export interface PerformanceDiagnostics {
  fps: number;
  frameTimeMs: number;
  memoryHeapMb: number | null;
  activeMeshes: number;
  drawCalls: number;
  triangles: number;
  physicsObjects: number;
  aiNodes: number;
  renderScale: number;
  rendererName: string;
  isSoftwareGl: boolean;
}

export const DEFAULT_ADVANCED_GRAPHICS: AdvancedGraphicsSettings = {
  qualityPreset: 'high',
  renderScale: 1.0,
  shadowQuality: 'high',
  textureQuality: 'high',
  antiAliasing: 'fxaa',
  ambientOcclusion: 'low',
  viewDistance: 150,
  effectsQuality: 'high',
  postProcessing: true,
  vsync: true,
  fpsLimit: 60,
  dynamicResolution: true,
};

export const DEFAULT_CONTROL_LAYOUT: ControlLayoutConfig = {
  joystick: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
  actionCluster: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
  interactButton: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
  combatCluster: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
  vitalsBar: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
  miniMap: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
  objectiveTracker: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
};

declare global {
  interface Window {
    __togglePhysicsWireframes: () => boolean;
    __runPhysicsTests: () => any;
  }
}

