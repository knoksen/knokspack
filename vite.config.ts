import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
        return {
      plugins: [react()],
      // No API keys are compiled into the bundle: AI calls go through the
      // plugin's REST endpoint, which reads the key from WordPress settings.
      // PostCSS is configured via postcss.config.js at project root
      build: {
        manifest: true,
        outDir: 'dist',
        rollupOptions: {
          // Entry is index.tsx directly; WordPress prints the mount point.
          input: {
            main: path.resolve(__dirname, 'index.tsx')
          },
          output: {
            manualChunks: {
              'vendor': ['react', 'react-dom', 'react-router-dom'],
            },
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Relative base so the plugin works from any folder name / subdirectory install.
      base: './',
    };
});
