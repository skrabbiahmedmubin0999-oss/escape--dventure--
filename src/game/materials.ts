import * as THREE from 'three';

/**
 * Advanced Procedural Texture Generator
 * Creates structured, organic-looking noise for PBR mapping
 */
function createProceduralTexture(size: number, type: 'rock' | 'grass' | 'grain'): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as any);
  }
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  // Simple layered noise simulation
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const idx = (i + j * size) * 4;
      
      let val = 0;
      if (type === 'rock') {
        val = (Math.sin(i * 0.1) * Math.cos(j * 0.1) * 0.5 + 0.5) * 128;
        val += Math.random() * 64;
      } else if (type === 'grass') {
        val = (Math.sin(i * 0.5) * Math.sin(j * 0.05) * 0.5 + 0.5) * 100;
        val += Math.random() * 50;
      } else {
        val = 128 + (Math.random() - 0.5) * 60;
      }

      const finalVal = Math.max(0, Math.min(255, val));
      data[idx] = finalVal;
      data[idx + 1] = finalVal;
      data[idx + 2] = finalVal;
      data[idx + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const rockNoise = createProceduralTexture(512, 'rock');
const grassNoise = createProceduralTexture(512, 'grass');
const fineGrain = createProceduralTexture(256, 'grain');

/**
 * Premium PBR Materials System
 * Defined once to optimize draw calls and GPU memory
 */
export const Materials = {
  // Ancient weathered stone
  stone: new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.85,
    metalness: 0.1,
    bumpMap: rockNoise,
    bumpScale: 0.05,
    roughnessMap: rockNoise,
  }),
  
  // Warm temple sandstone
  sandstone: new THREE.MeshStandardMaterial({
    color: 0xe2b171,
    roughness: 0.9,
    metalness: 0.05,
    bumpMap: rockNoise,
    bumpScale: 0.03,
  }),

  // Polished ancient wood
  wood: new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.7,
    metalness: 0.0,
    bumpMap: fineGrain,
    bumpScale: 0.01,
  }),

  // Antique brass/gold for artifacts
  metal: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.85,
  }),

  // Dark iron for weapons
  iron: new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.7,
  }),

  // Lush organic grass
  grass: new THREE.MeshStandardMaterial({
    color: 0x166534,
    roughness: 0.95,
    metalness: 0.0,
    bumpMap: grassNoise,
    bumpScale: 0.1,
  }),

  // Rich island soil
  soil: new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.9,
    metalness: 0.0,
  }),
  
  // Magical emissive crystals
  crystal: new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    emissive: 0x0ea5e9,
    emissiveIntensity: 2.0,
    roughness: 0.1,
    metalness: 0.5,
    transparent: true,
    opacity: 0.9,
  }),
};
