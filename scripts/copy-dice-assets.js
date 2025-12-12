import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination
// Source: node_modules/@3d-dice/dice-box/dist/assets
// Destination: public/assets/dice-box

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'node_modules', '@3d-dice', 'dice-box', 'dist', 'assets');
const destDir = path.join(projectRoot, 'public', 'assets', 'dice-box');

console.log(`Copying assets from ${srcDir} to ${destDir}...`);

try {
  // Ensure source exists
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory does not exist: ${srcDir}`);
    console.error('Make sure @3d-dice/dice-box is installed.');
    process.exit(1);
  }

  // Create destination directory
  fs.mkdirSync(destDir, { recursive: true });

  // Copy recursively
  fs.cpSync(srcDir, destDir, { recursive: true });

  console.log('Assets copied successfully!');
} catch (err) {
  console.error('Error copying assets:', err);
  process.exit(1);
}
