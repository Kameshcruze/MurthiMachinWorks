import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import {defineConfig, Plugin} from 'vite';

const autoWebpPlugin = (): Plugin => ({
  name: 'auto-webp-converter',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const convertWebp = (name: string) => {
        const publicDir = path.resolve(__dirname, 'public');
        const candidates = [
          path.join(publicDir, `${name}.png`),
          path.join(publicDir, `${name}.jpg`),
          path.join(publicDir, `${name}.jpeg`),
          path.resolve(__dirname, `${name}.png`),
          path.resolve(__dirname, `${name}.jpg`),
          path.resolve(__dirname, `${name}.jpeg`),
        ];
        for (const src of candidates) {
          if (fs.existsSync(src)) {
            const target = path.join(publicDir, `${name}.webp`);
            try {
              const srcTime = fs.statSync(src).mtimeMs;
              const targetTime = fs.existsSync(target) ? fs.statSync(target).mtimeMs : 0;
              if (srcTime > targetTime) {
                execSync(`convert "${src}" -quality 85 "${target}"`);
              }
            } catch (e) {
              console.error(`Failed to convert ${name} to webp:`, e);
            }
            break;
          }
        }
      };

      if (req.url) {
        if (req.url.startsWith('/about-us.webp')) {
          convertWebp('about-us');
        } else if (req.url.startsWith('/hero-banner.webp')) {
          convertWebp('hero-banner');
        } else if (req.url.startsWith('/hero-banner-mob.webp')) {
          convertWebp('hero-banner-mob');
        }
      }
      next();
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), autoWebpPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
