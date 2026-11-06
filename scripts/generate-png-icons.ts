import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';

function createIcon(width: number, height: number, isMaskable = false): Buffer {
  const png = new PNG({ width, height });
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) * (isMaskable ? 0.35 : 0.42);
  const innerRadius = outerRadius * 0.2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Default background: #020617
      let r = 2;
      let g = 6;
      let b = 23;
      let a = 255;

      // Outer gold ring
      if (Math.abs(dist - outerRadius) < width * 0.025) {
        r = 245; g = 158; b = 11; // #f59e0b
      } 
      // Compass Rose Pointed Star
      else if (dist < outerRadius && dist > innerRadius) {
        const ray8 = Math.cos(angle * 4); // 4-pointed star primary
        const rayDiagonal = Math.cos((angle + Math.PI / 4) * 4);
        
        if (ray8 > 0.65 && dist < outerRadius * (0.4 + 0.6 * Math.pow(ray8, 3))) {
          // North needle (top quadrant dy < 0) red vs gold
          if (dy < 0 && Math.abs(dx) < Math.abs(dy) * 0.5) {
            r = 239; g = 68; b = 68; // Red needle tip
          } else {
            r = 245; g = 158; b = 11; // Gold star
          }
        } else if (rayDiagonal > 0.8 && dist < outerRadius * 0.6) {
          r = 217; g = 119; b = 6; // Darker amber diagonal points
        }
      }
      // Center golden hub
      else if (dist <= innerRadius) {
        r = 254; g = 240; b = 138; // #fef08a bright gold core
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return PNG.sync.write(png);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createIcon(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createIcon(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createIcon(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createIcon(180, 180));
console.log('✅ Generated crisp PWA PNG icons in /public!');
