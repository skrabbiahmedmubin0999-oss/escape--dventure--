/**
 * Escape Adventure 3D — Advanced Feature Registry System
 * Centralized feature registry managing feature dependencies, lifecycle (init/cleanup),
 * status validation, and runtime persistence.
 */

import { FeatureModuleConfig } from './types';

export interface FeatureDefinition extends FeatureModuleConfig {
  dependencies: string[];
  compatibility: string;
  defaultState: boolean;
  init?: (context?: any) => boolean | Promise<boolean>;
  cleanup?: (context?: any) => void | Promise<void>;
  configSchema?: Record<string, unknown>;
}

class FeatureRegistry {
  private features: Map<string, FeatureDefinition> = new Map();
  private initialized = false;

  constructor() {
    this.registerDefaultFeatures();
  }

  private registerDefaultFeatures() {
    const defaultList: FeatureDefinition[] = [
      {
        id: 'dyn_res',
        name: 'Dynamic Resolution Scaling',
        category: 'Graphics',
        description: 'Automatically adjusts render scale when frame rate drops below target FPS.',
        dependencies: [],
        compatibility: 'WebGL2 / WebGL1',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'soft_shadows',
        name: 'PCF Shadow Map Filtering',
        category: 'Graphics',
        description: 'High-performance Percentage-Closer Filtering for directional scene shadows.',
        dependencies: [],
        compatibility: 'WebGL2',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Medium',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'ssao_ambient_occlusion',
        name: 'Ambient Occlusion Shading',
        category: 'Graphics',
        description: 'Adds contact shading in geometric crevices and terrain foliage.',
        dependencies: ['soft_shadows'],
        compatibility: 'Desktop / High Mobile',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Medium',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'pbr_anisotropy',
        name: 'Anisotropic Texture Filtering',
        category: 'Graphics',
        description: 'Preserves crisp terrain texture detail at oblique viewing angles.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'occlusion_culling',
        name: 'Frustum & Distance Occlusion Culling',
        category: 'Performance',
        description: 'Suppresses draw calls for off-screen and distant world geometry.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'object_pooling',
        name: 'Particle & VFX Object Pooling',
        category: 'Performance',
        description: 'Pre-allocates impact particles and ripples to avoid garbage collection spikes.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Zero',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'adv_enemy_ai',
        name: 'Advanced Guard Patrol & Investigation AI',
        category: 'AI',
        description: 'Multi-stage state machine (Patrol -> Suspicious -> Investigate -> Search -> Return).',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'guard_dog_ai',
        name: 'Guard Dog Scent Tracking AI',
        category: 'AI',
        description: 'Real-time player scent trail tracking, water neutralization, and alert barking.',
        dependencies: ['adv_enemy_ai'],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'improved_combat',
        name: 'Tactical Blade & Parry Combat System',
        category: 'Gameplay',
        description: 'Precision melee swing hitboxes, timed parry counter-attacks, and dodge rolls.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'realistic_physics',
        name: 'Sub-stepping Anti-Tunneling Collision Engine',
        category: 'Gameplay',
        description: 'Multi-substep physics solver with tangent wall sliding and door triggers.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'dynamic_lighting',
        name: 'Dynamic Atmosphere & Time-of-Day Lighting',
        category: 'Graphics',
        description: 'Smooth lerped sun angles, sky colors, ambient fog, and weather transitions.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'camera_collision',
        name: 'Smart Camera Obstacle Avoidance',
        category: 'Controls',
        description: 'Automatically zooms camera forward when walls or trees obstruct player line-of-sight.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'advanced_audio',
        name: 'Procedural Web Audio Synthesizer',
        category: 'Audio',
        description: 'Zero-asset synthesized footstep, jump, sword slash, level-up, and ambient sound engine.',
        dependencies: [],
        compatibility: 'Web Audio API',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Low',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'haptics_feedback',
        name: 'Vibration Haptics Motor',
        category: 'Controls',
        description: 'Tactile mobile vibration feedback on damage, jump, parry, and stone throw.',
        dependencies: [],
        compatibility: 'Navigator Vibration API',
        defaultState: true,
        enabled: typeof navigator !== 'undefined' && 'vibrate' in navigator,
        status: typeof navigator !== 'undefined' && 'vibrate' in navigator ? 'active' : 'supported',
        performanceImpact: 'Zero',
        init: () => typeof navigator !== 'undefined' && 'vibrate' in navigator,
        cleanup: () => {},
      },
      {
        id: 'hud_editor',
        name: 'Interactive HUD Customizer',
        category: 'HUD',
        description: 'Drag-and-drop repositioning, scaling, opacity, and safe-area alignment tool.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: true,
        enabled: true,
        status: 'active',
        performanceImpact: 'Zero',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'dev_diagnostics',
        name: 'Real-Time Developer Diagnostic HUD',
        category: 'Experimental',
        description: 'Displays live FPS, frame time, draw calls, triangle count, and memory heap metrics.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: false,
        enabled: false,
        status: 'supported',
        performanceImpact: 'Zero',
        init: () => true,
        cleanup: () => {},
      },
      {
        id: 'accessibility_high_contrast',
        name: 'Accessibility High-Contrast Interface',
        category: 'Accessibility',
        description: 'Enforces high-contrast UI borders, bold typography, and enlarged touch targets.',
        dependencies: [],
        compatibility: 'All Devices',
        defaultState: false,
        enabled: false,
        status: 'supported',
        performanceImpact: 'Zero',
        init: () => true,
        cleanup: () => {},
      },
    ];

    defaultList.forEach((feat) => this.features.set(feat.id, feat));
  }

  public registerFeature(definition: FeatureDefinition) {
    this.features.set(definition.id, definition);
  }

  public getAllFeatures(): FeatureDefinition[] {
    return Array.from(this.features.values());
  }

  public getFeature(id: string): FeatureDefinition | undefined {
    return this.features.get(id);
  }

  public async setFeatureEnabled(id: string, enabled: boolean, context?: any): Promise<boolean> {
    const feat = this.features.get(id);
    if (!feat) return false;

    if (enabled) {
      // Check dependency resolution
      for (const depId of feat.dependencies) {
        const dep = this.features.get(depId);
        if (!dep || !dep.enabled) {
          console.warn(`[FeatureRegistry] Cannot enable ${feat.name}: missing dependency ${depId}`);
          feat.enabled = false;
          feat.status = 'failed';
          return false;
        }
      }

      // Safe initialization
      try {
        if (feat.init) {
          const success = await feat.init(context);
          if (success === false) {
            feat.enabled = false;
            feat.status = 'failed';
            return false;
          }
        }
        feat.enabled = true;
        feat.status = 'active';
        return true;
      } catch (err) {
        console.error(`[FeatureRegistry] Feature ${feat.name} failed to initialize:`, err);
        feat.enabled = false;
        feat.status = 'failed';
        return false;
      }
    } else {
      // Cleanup execution
      try {
        if (feat.cleanup) {
          await feat.cleanup(context);
        }
      } catch (err) {
        console.warn(`[FeatureRegistry] Feature ${feat.name} cleanup error:`, err);
      }
      feat.enabled = false;
      feat.status = 'supported';
      return true;
    }
  }

  public hydrateState(savedState: Record<string, boolean>) {
    for (const [id, enabled] of Object.entries(savedState)) {
      const feat = this.features.get(id);
      if (feat) {
        if (enabled) {
          this.setFeatureEnabled(id, true).catch(() => {});
        } else {
          feat.enabled = false;
          feat.status = 'supported';
        }
      }
    }
  }
}

export const featureRegistry = new FeatureRegistry();
