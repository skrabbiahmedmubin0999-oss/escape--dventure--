import * as THREE from 'three';
import { AdventurerCharacter, createAdventurerModel, getIslandHeight } from './proceduralAssets';
import { CollisionSystem, CollisionLayer } from './collisionSystem';
import { sound } from '../audio/soundSystem';

export type DogAIState =
  | 'patrol'
  | 'sniff'
  | 'track'
  | 'alert'
  | 'investigate'
  | 'chase'
  | 'catch'
  | 'return';

export interface ScentPoint {
  pos: THREE.Vector3;
  time: number;
}

export interface PatrolDog {
  id: string;
  name: string;
  character: AdventurerCharacter;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  waypoints: THREE.Vector3[];
  pauseDurations: number[];
  pauseTimer: number;
  currentWaypointIdx: number;
  state: DogAIState;
  health: number;
  barkTimer: number;
  lastCaughtTime: number;
}

export class DogAIController {
  private dogs: PatrolDog[] = [];
  private collisionSystem?: CollisionSystem;
  
  public onPlayerCaught?: (dogName: string) => void;
  public onDogAlert?: (dogName: string) => void;

  public setCollisionSystem(cs: CollisionSystem) {
    this.collisionSystem = cs;
  }

  public initDogs(scene: THREE.Scene) {
    // Basic setup for 1 patrol dog
    this.dogs.push({
      id: 'dog_1',
      name: 'Guard Dog',
      character: createAdventurerModel('#57534e', '#57534e'), // Simple brown dog representation
      position: new THREE.Vector3(12, 0, 12),
      velocity: new THREE.Vector3(),
      rotation: 0,
      waypoints: [
        new THREE.Vector3(-10, 0, 10),
        new THREE.Vector3(10, 0, 10),
        new THREE.Vector3(10, 0, -10),
        new THREE.Vector3(-10, 0, -10),
      ],
      pauseDurations: [1.5, 1.5, 1.5, 1.5],
      pauseTimer: 0,
      currentWaypointIdx: 0,
      state: 'patrol',
      health: 50,
      barkTimer: 0,
      lastCaughtTime: 0,
    });
    this.dogs.forEach(d => scene.add(d.character.group));
  }

  public updateDogs(playerPos: THREE.Vector3, scentTrail: ScentPoint[], dt: number, time: number) {
    this.dogs.forEach((dog) => {
      // 1. Barking logic
      if (dog.state === 'chase' || dog.state === 'alert' || dog.state === 'track') {
        dog.barkTimer -= dt;
        if (dog.barkTimer <= 0) {
          sound.playBark();
          dog.barkTimer = 1.0 + Math.random() * 2.0;
          if (dog.state === 'alert' && this.onDogAlert) {
            this.onDogAlert(dog.name);
          }
        }
      }

      // 2. State machine
      let moveSpeed = 0;
      let targetPos: THREE.Vector3 | null = null;

      if (dog.state === 'patrol') {
        const wp = dog.waypoints[dog.currentWaypointIdx];
        const dist = dog.position.distanceTo(wp);
        if (dist < 1.2) {
          dog.pauseTimer = dog.pauseDurations[dog.currentWaypointIdx] || 1.5;
          dog.currentWaypointIdx = (dog.currentWaypointIdx + 1) % dog.waypoints.length;
        } else if (dog.pauseTimer > 0) {
          dog.pauseTimer -= dt;
        } else {
          targetPos = wp;
          moveSpeed = 2.0;
        }

        // Sniff player scent trail (decayed scent)
        if (scentTrail.length > 0) {
          const freshestScent = scentTrail[scentTrail.length - 1];
          const scentAge = time - freshestScent.time;
          
          if (scentAge < 10.0) { // Scent is fresh enough
            const dToScent = dog.position.distanceTo(freshestScent.pos);
            if (dToScent < 10.0) {
              dog.state = 'sniff';
              dog.barkTimer = 0.2; // Quick bark when finding scent
            }
          }
        }
      } else if (dog.state === 'sniff') {
        const targetScent = scentTrail[scentTrail.length - 1];
        if (targetScent && (time - targetScent.time < 10.0)) {
          dog.rotation = Math.atan2(targetScent.pos.x - dog.position.x, targetScent.pos.z - dog.position.z);
          dog.state = 'track';
        } else {
          dog.state = 'patrol';
        }
      } else if (dog.state === 'investigate') {
        targetPos = dog.waypoints[dog.currentWaypointIdx]; // Fallback
        // This state is currently triggered by noise distraction
        moveSpeed = 3.5;
        // In this simple implementation, investigate just moves to a specific spot
        // but we'll set it up for noise distraction later
      } else if (dog.state === 'track' || dog.state === 'chase') {
        const isChase = dog.state === 'chase';
        const target = isChase ? playerPos : scentTrail[scentTrail.length - 1]?.pos;
        
        if (target) {
          targetPos = target;
          moveSpeed = isChase ? 4.5 : 3.0;
          
          const dToPlayer = dog.position.distanceTo(playerPos);
          if (dToPlayer < 1.5) {
            dog.state = 'catch';
          } else if (dToPlayer < 12.0) {
            if (dog.state !== 'chase' && this.onDogAlert) {
              this.onDogAlert(dog.name);
            }
            dog.state = 'chase';
          } else if (isChase && dToPlayer > 15.0) {
            dog.state = 'track'; // Lost sight, back to tracking
          }
        } else {
          dog.state = 'patrol';
        }
      } else if (dog.state === 'catch') {
        // More deliberate catch: hold for a moment for a lunge effect
        if (time - dog.lastCaughtTime > 0.8) {
          if (this.onPlayerCaught) {
            this.onPlayerCaught(dog.name);
          }
          dog.lastCaughtTime = time;
          dog.state = 'return';
        }
      } else if (dog.state === 'return') {
        targetPos = dog.waypoints[dog.currentWaypointIdx];
        moveSpeed = 2.5;
        if (dog.position.distanceTo(targetPos) < 1.0) {
          dog.state = 'patrol';
        }
      }
      
      // Apply Movement with Collision
      if (targetPos && moveSpeed > 0) {
        _vec3A.subVectors(targetPos, dog.position);
        _vec3A.y = 0;
        if (_vec3A.lengthSq() > 0.01) {
          _vec3A.normalize().multiplyScalar(moveSpeed);
          const vel = new THREE.Vector3(_vec3A.x, 0, _vec3A.z);
          
          if (this.collisionSystem) {
            this.collisionSystem.resolveMovementWithSubstepping(dog.position, vel, dt, 0.45);
          } else {
            dog.position.addScaledVector(vel, dt);
          }
          
          dog.rotation = Math.atan2(vel.x, vel.z);
        }
      }

      // Update character position/animation
      const groundY = getIslandHeight(dog.position.x, dog.position.z);
      dog.position.y = groundY;
      dog.character.group.position.copy(dog.position);
      dog.character.group.rotation.y = dog.rotation;
      
      const animSpeed = dog.state === 'chase' ? 2.0 : (moveSpeed > 0 ? 1.0 : 0);
      dog.character.updateAnimation(time, animSpeed, false, dog.state === 'chase');
    });
  }

  public triggerNoiseDistraction(pos: THREE.Vector3, radius: number) {
    this.dogs.forEach((dog) => {
      if (dog.state === 'patrol' || dog.state === 'sniff' || dog.state === 'track') {
        const dist = dog.position.distanceTo(pos);
        if (dist < radius) {
          dog.state = 'investigate';
          // For simplicity, dogs will just bark and move towards noise
          dog.barkTimer = 0.1;
        }
      }
    });
  }
}

const _vec3A = new THREE.Vector3();
export const dogAIController = new DogAIController();
