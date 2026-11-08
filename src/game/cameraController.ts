import * as THREE from 'three';
import { getIslandHeight } from './proceduralAssets';
import { GameMode } from './types';

const _camTarget = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _shakeOffset = new THREE.Vector3();

export class CameraController {
  public cameraDistance: number = 7.2;
  public cameraPitch: number = 0.45; // Adjusted for better view
  public cameraYaw: number = 0;
  public mouseSensitivity: number = 1.0;
  public invertY: boolean = false;

  private currentLookTarget: THREE.Vector3 = new THREE.Vector3();
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;

  public onPointerDrag(deltaX: number, deltaY: number) {
    const factor = 0.003 * this.mouseSensitivity;
    this.cameraYaw -= deltaX * factor;
    const yDir = this.invertY ? -1 : 1;
    this.cameraPitch = THREE.MathUtils.clamp(
      this.cameraPitch - deltaY * factor * yDir,
      0.1,
      1.4
    );
  }

  public onZoom(delta: number) {
    this.cameraDistance = THREE.MathUtils.clamp(this.cameraDistance + delta * 0.006, 4.0, 16.0);
  }

  public triggerShake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  public update(
    camera: THREE.PerspectiveCamera,
    playerPos: THREE.Vector3,
    dt: number,
    mode: GameMode,
    time: number
  ) {
    const clampedDt = Math.min(dt, 0.05);

    if (mode === 'menu') {
      // Elegant slow orbit for main menu
      const orbitRadius = 55;
      const orbitSpeed = 0.08;
      const camX = Math.sin(time * orbitSpeed) * orbitRadius;
      const camZ = Math.cos(time * orbitSpeed) * orbitRadius;
      camera.position.set(camX, 22 + Math.sin(time * 0.15) * 4, camZ);
      
      // Look at island center with subtle drift
      _camTarget.set(Math.sin(time * 0.1) * 2, 4, Math.cos(time * 0.1) * 2);
      camera.lookAt(_camTarget);
      return;
    }

    if (mode === 'victory') {
      const vicAngle = time * 0.5;
      camera.position.set(
        playerPos.x + Math.sin(vicAngle) * 8,
        playerPos.y + 4.0,
        playerPos.z + Math.cos(vicAngle) * 8
      );
      camera.lookAt(playerPos.x, playerPos.y + 1.2, playerPos.z);
      return;
    }

    if (mode === 'playing') {
      // Base target at player's head height
      _camTarget.set(playerPos.x, playerPos.y + 1.6, playerPos.z);

      // Spherical coordinates for ideal position
      const cy = Math.cos(this.cameraPitch) * this.cameraDistance;
      const cx = Math.sin(this.cameraYaw) * cy;
      const cz = Math.cos(this.cameraYaw) * cy;
      const ch = Math.sin(this.cameraPitch) * this.cameraDistance;

      _camPos.set(_camTarget.x + cx, _camTarget.y + ch, _camTarget.z + cz);

      // Procedural Breath/Sway for cinematic feel
      const swayX = Math.sin(time * 0.5) * 0.05;
      const swayY = Math.cos(time * 0.4) * 0.05;
      _camPos.x += swayX;
      _camPos.y += swayY;

      // Handle Camera Shake
      if (this.shakeTimer > 0) {
        this.shakeTimer -= clampedDt;
        const s = this.shakeIntensity * (this.shakeTimer / 0.5);
        _shakeOffset.set(
          (Math.random() - 0.5) * s,
          (Math.random() - 0.5) * s,
          (Math.random() - 0.5) * s
        );
        _camPos.add(_shakeOffset);
      }

      // Terrain collision clamping
      const minHeight = getIslandHeight(_camPos.x, _camPos.z) + 0.8;
      if (_camPos.y < minHeight) {
        _camPos.y = minHeight;
      }

      // Smooth Pos Damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _camPos.x, 8, clampedDt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _camPos.y, 8, clampedDt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _camPos.z, 8, clampedDt);

      // Smooth Look Damping
      this.currentLookTarget.x = THREE.MathUtils.damp(this.currentLookTarget.x, _camTarget.x, 10, clampedDt);
      this.currentLookTarget.y = THREE.MathUtils.damp(this.currentLookTarget.y, _camTarget.y, 6, clampedDt);
      this.currentLookTarget.z = THREE.MathUtils.damp(this.currentLookTarget.z, _camTarget.z, 10, clampedDt);

      camera.lookAt(this.currentLookTarget);
    }
  }
}

export const cameraController = new CameraController();
