import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public', 'icons');
mkdirSync(publicDir, { recursive: true });

const svg = readFileSync(resolve(publicDir, 'icon.svg'), 'utf-8');

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(publicDir, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}
