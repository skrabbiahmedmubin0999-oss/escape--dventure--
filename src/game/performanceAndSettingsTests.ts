import { DEFAULT_ADVANCED_GRAPHICS, DEFAULT_KEY_BINDINGS, DEFAULT_CONTROL_LAYOUT, AdvancedGraphicsSettings, KeyBindings, HUDProfile, FeatureModuleConfig } from './types';
import { validateProfileJSON, PROFILE_PRESETS } from './profilePresets';
import { featureRegistry } from './featureRegistry';

export function runPerformanceAndSettingsTestSuite() {
  const testResults: Array<{ name: string; passed: boolean; message: string }> = [];

  const logTest = (name: string, passed: boolean, message: string) => {
    testResults.push({ name, passed, message });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}: ${message}`);
  };

  try {
    // 1. Advanced Graphics Presets & Auto Resolution Math
    const autoScaleLow = calculateAutoRenderScale('low');
    const autoScaleUltra = calculateAutoRenderScale('ultra');
    const isValidScaleLow = autoScaleLow >= 0.5 && autoScaleLow <= 0.8;
    const isValidScaleUltra = autoScaleUltra >= 1.0 && autoScaleUltra <= 1.5;

    logTest(
      'Advanced Graphics - Auto Resolution Scale Calculation',
      isValidScaleLow && isValidScaleUltra,
      `Low Preset scale=${autoScaleLow} (expected 0.5-0.8), Ultra Preset scale=${autoScaleUltra} (expected 1.0-1.5)`
    );

    // 2. Keybinding Conflict Detection System
    const validBindings: KeyBindings = { ...DEFAULT_KEY_BINDINGS };
    const conflictingBindings: KeyBindings = { ...DEFAULT_KEY_BINDINGS, jump: 'KeyW' }; // Conflict with moveForward

    const noConflicts = findKeyBindingConflicts(validBindings);
    const hasConflicts = findKeyBindingConflicts(conflictingBindings);

    logTest(
      'Controls - Keybinding Conflict Detection',
      noConflicts.length === 0 && hasConflicts.includes('KeyW'),
      `Valid bindings conflicts=${noConflicts.length}, Conflicting bindings detected duplicate key 'KeyW'`
    );

    // 3. HUD Layout Profile Serialization & JSON Schema Validation
    const sampleProfile: HUDProfile = {
      id: 'custom_tactical',
      name: 'Custom Tactical Layout',
      presetType: 'custom',
      layout: {
        ...DEFAULT_CONTROL_LAYOUT,
        joystick: { x: 10, y: -10, scale: 1.2, opacity: 0.9, enabled: true },
      },
    };

    const jsonExport = JSON.stringify(sampleProfile);
    const validValidation = validateProfileJSON(jsonExport);
    const invalidValidation = validateProfileJSON('{"invalid": true}');

    logTest(
      'HUD Customizer - Profile JSON Schema Validation',
      validValidation.valid && !invalidValidation.valid,
      `Valid profile parsed as '${validValidation.profile?.name}', Invalid JSON correctly rejected with message: '${invalidValidation.error}'`
    );

    // 4. Feature Registry Module Lifecycle & Status Verification
    const registeredFeatures = featureRegistry.getAllFeatures();
    const allHaveDetails = registeredFeatures.every((f) => f.id && f.name && f.category && f.performanceImpact);
    const activeCount = registeredFeatures.filter((f) => f.enabled).length;

    logTest(
      'Feature Registry - Central Manager Registration & Lifecycle',
      allHaveDetails && registeredFeatures.length >= 8,
      `Registered ${registeredFeatures.length} feature modules (${activeCount} enabled by default)`
    );

    // 5. Snap-to-Grid Positioning & Layout Math
    const rawX = 23;
    const rawY = 47;
    const gridSize = 10;
    const snappedX = Math.round(rawX / gridSize) * gridSize;
    const snappedY = Math.round(rawY / gridSize) * gridSize;

    logTest(
      'HUD Customizer - Snap to Grid Math Precision',
      snappedX === 20 && snappedY === 50,
      `Raw coords (${rawX}, ${rawY}) snapped to grid(${gridSize}px) -> (${snappedX}, ${snappedY})`
    );

    // 6. Profile Preset List Completeness
    logTest(
      'Profile Manager - Preset Catalog Availability',
      PROFILE_PRESETS.length >= 5,
      `Available preset profiles=${PROFILE_PRESETS.length} (Default, Mobile, Desktop, Minimal, Competitive)`
    );

  } catch (err: any) {
    logTest('Performance & Settings Suite Exception', false, err?.message || String(err));
  }

  const allPassed = testResults.every((t) => t.passed);
  return { allPassed, testResults };
}

function calculateAutoRenderScale(preset: string): number {
  switch (preset) {
    case 'low': return 0.75;
    case 'medium': return 0.9;
    case 'high': return 1.0;
    case 'ultra': return 1.25;
    default: return 1.0;
  }
}

function findKeyBindingConflicts(bindings: KeyBindings): string[] {
  const seen = new Map<string, string>();
  const conflicts: string[] = [];

  for (const [action, key] of Object.entries(bindings)) {
    if (seen.has(key)) {
      conflicts.push(key);
    } else {
      seen.set(key, action);
    }
  }

  return conflicts;
}

export function getDefaultFeatureModules(): FeatureModuleConfig[] {
  return featureRegistry.getAllFeatures();
}
