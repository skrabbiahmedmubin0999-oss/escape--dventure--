/**
 * Escape Adventure 3D — Profile Presets & Layout Schemas
 */

import { HUDProfile, ControlLayoutConfig, DEFAULT_CONTROL_LAYOUT } from './types';

export const PROFILE_PRESETS: HUDProfile[] = [
  {
    id: 'profile_default',
    name: 'Default Mobile',
    presetType: 'default',
    layout: DEFAULT_CONTROL_LAYOUT,
  },
  {
    id: 'profile_mobile',
    name: 'Mobile Touch Optimized',
    presetType: 'mobile',
    layout: {
      joystick: { x: 10, y: -10, scale: 1.1, opacity: 0.9, enabled: true },
      actionCluster: { x: -10, y: -10, scale: 1.1, opacity: 0.9, enabled: true },
      interactButton: { x: -15, y: -80, scale: 1.15, opacity: 1.0, enabled: true },
      combatCluster: { x: -10, y: -150, scale: 1.1, opacity: 0.95, enabled: true },
      vitalsBar: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
      miniMap: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
      objectiveTracker: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
    },
  },
  {
    id: 'profile_desktop',
    name: 'Desktop Keyboard & Mouse',
    presetType: 'desktop',
    layout: {
      joystick: { x: 0, y: 0, scale: 0.75, opacity: 0.2, enabled: false },
      actionCluster: { x: 0, y: 0, scale: 0.75, opacity: 0.2, enabled: false },
      interactButton: { x: 0, y: 0, scale: 0.9, opacity: 0.5, enabled: true },
      combatCluster: { x: 0, y: 0, scale: 0.75, opacity: 0.2, enabled: false },
      vitalsBar: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
      miniMap: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
      objectiveTracker: { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true },
    },
  },
  {
    id: 'profile_minimal',
    name: 'Minimal Clean HUD',
    presetType: 'minimal',
    layout: {
      joystick: { x: 0, y: 0, scale: 0.85, opacity: 0.35, enabled: true },
      actionCluster: { x: 0, y: 0, scale: 0.85, opacity: 0.35, enabled: true },
      interactButton: { x: 0, y: 0, scale: 0.9, opacity: 0.5, enabled: true },
      combatCluster: { x: 0, y: 0, scale: 0.85, opacity: 0.35, enabled: true },
      vitalsBar: { x: 0, y: 0, scale: 0.85, opacity: 0.6, enabled: true },
      miniMap: { x: 0, y: 0, scale: 0.85, opacity: 0.6, enabled: true },
      objectiveTracker: { x: 0, y: 0, scale: 0.85, opacity: 0.6, enabled: true },
    },
  },
  {
    id: 'profile_competitive',
    name: 'Competitive Speedrun / Hardcore',
    presetType: 'advanced',
    layout: {
      joystick: { x: 20, y: -20, scale: 1.25, opacity: 1.0, enabled: true },
      actionCluster: { x: -20, y: -20, scale: 1.25, opacity: 1.0, enabled: true },
      interactButton: { x: -20, y: -100, scale: 1.25, opacity: 1.0, enabled: true },
      combatCluster: { x: -20, y: -180, scale: 1.25, opacity: 1.0, enabled: true },
      vitalsBar: { x: 0, y: 0, scale: 1.1, opacity: 1.0, enabled: true },
      miniMap: { x: 0, y: 0, scale: 1.1, opacity: 1.0, enabled: true },
      objectiveTracker: { x: 0, y: 0, scale: 1.1, opacity: 1.0, enabled: true },
    },
  },
];

/**
 * Validates JSON schema for Profile imports
 */
export function validateProfileJSON(jsonString: string): { valid: boolean; profile?: HUDProfile; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'JSON payload must be an object.' };
    }

    if (!data.name || typeof data.name !== 'string') {
      return { valid: false, error: 'Missing or invalid profile "name" field.' };
    }

    if (!data.layout || typeof data.layout !== 'object') {
      return { valid: false, error: 'Missing or invalid profile "layout" object.' };
    }

    const reqKeys: (keyof ControlLayoutConfig)[] = ['joystick', 'actionCluster', 'interactButton', 'combatCluster'];
    for (const key of reqKeys) {
      if (!data.layout[key] || typeof data.layout[key].scale !== 'number' || typeof data.layout[key].opacity !== 'number') {
        return { valid: false, error: `Invalid control configuration for "${key}".` };
      }
    }

    const profile: HUDProfile = {
      id: data.id || `custom_${Date.now()}`,
      name: data.name,
      presetType: data.presetType || 'custom',
      layout: data.layout,
    };

    return { valid: true, profile };
  } catch (err: any) {
    return { valid: false, error: `JSON Parse Error: ${err?.message || 'Invalid JSON format'}` };
  }
}
