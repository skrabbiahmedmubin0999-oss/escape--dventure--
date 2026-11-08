/**
 * ScentTrailSystem
 * Manages player scent trails for the Guard Dog AI.
 */

import * as THREE from 'three';
import { ScentPoint } from './dogAI';

export class ScentTrailSystem {
  private trails: ScentPoint[] = [];
  private readonly maxTrails: number = 500;
  private readonly persistenceMs: number = 30000; // 30 seconds

  public addNode(position: THREE.Vector3) {
    const now = Date.now();
    this.trails.push({ pos: position.clone(), time: now });

    // Enforce limits
    if (this.trails.length > this.maxTrails) {
      this.trails.shift();
    }
  }

  public getTrails(): ScentPoint[] {
    const now = Date.now();
    // Filter out expired trails
    this.trails = this.trails.filter(t => now - t.time < this.persistenceMs);
    return this.trails;
  }

  public getLatestScent(): ScentPoint | null {
    return this.trails.length > 0 ? this.trails[this.trails.length - 1] : null;
  }

  public clear() {
    this.trails = [];
  }
}
