const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.resolve(__dirname, '../public');

function convertIfFound() {
  const candidates = [
    path.join(publicDir, 'about-us.png'),
    path.join(publicDir, 'about-us.jpg'),
    path.join(publicDir, 'about-us.jpeg'),
    path.resolve(__dirname, '../about-us.png'),
    path.resolve(__dirname, '../about-us.jpg'),
    path.resolve(__dirname, '../about-us.jpeg'),
  ];

  for (const src of candidates) {
    if (fs.existsSync(src)) {
      const target = path.join(publicDir, 'about-us.webp');
      try {
        console.log(`Converting ${src} -> ${target}...`);
        execSync(`convert "${src}" -quality 85 "${target}"`);
        console.log(`Successfully converted to WebP!`);
        return true;
      } catch (err) {
        console.error(`Failed to convert ${src}:`, err.message);
      }
    }
  }
  return false;
}

convertIfFound();
