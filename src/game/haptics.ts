/**
 * Low-latency haptic vibration helper using browser Vibration API.
 * Provides tactile feedback for collisions, damage, and interactions.
 */

interface HapticState {
  enabled: boolean;
  intensity: 'low' | 'medium' | 'high';
  lastTriggerTime: number;
}

const state: HapticState = {
  enabled: true,
  intensity: 'medium',
  lastTriggerTime: 0,
};

// Throttle interval to prevent vibration stacking/exhaustion (ms)
const MIN_INTERVAL = 50;

/**
 * Robust check for vibration support
 */
export const isHapticsSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof navigator !== 'undefined' && 
         typeof navigator.vibrate === 'function';
};

/**
 * Update global haptic configuration from game settings
 */
export const configureHaptics = (enabled: boolean, intensity: 'low' | 'medium' | 'high') => {
  state.enabled = enabled;
  state.intensity = intensity;
};

/**
 * Intensity scaling factors
 */
const INTENSITY_SCALES = {
  low: 0.5,
  medium: 1.0,
  high: 1.8,
};

/**
 * Triggers a vibration pattern if supported and enabled.
 * Automatically scales duration based on intensity setting.
 */
export const triggerHaptic = (pattern: number | number[] = 15) => {
  if (!state.enabled || !isHapticsSupported()) return;

  const now = Date.now();
  if (now - state.lastTriggerTime < MIN_INTERVAL) return;

  const scale = INTENSITY_SCALES[state.intensity];
  
  try {
    let finalPattern: number | number[];
    
    if (typeof pattern === 'number') {
      finalPattern = Math.max(1, Math.round(pattern * scale));
    } else {
      // Scale each element in the pattern array
      finalPattern = pattern.map(v => Math.max(1, Math.round(v * scale)));
    }

    navigator.vibrate(finalPattern);
    state.lastTriggerTime = now;
  } catch (e) {
    // Graceful fallback for browser security restrictions or API unavailability
  }
};

export const Haptics = {
  // Light feedback for UI or minor interactions
  LIGHT: 10,
  // Medium feedback for stepping on platforms
  MEDIUM: 20,
  // Strong feedback for hazard hits
  HEAVY: 40,
  // Double pulse for critical damage or events
  DOUBLE: [30, 50, 30],
  // Success pattern
  SUCCESS: [15, 30, 15],
  // Alert pattern
  ALERT: [100, 50, 100],
};

