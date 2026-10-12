import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Library build for the `blueprintjs-react-table` npm package. The Vite dev
// app / Storybook build lives in `vite.config.ts`.
//
// Peer dependencies are externalized so the published bundle never ships its
// own copy of React, Blueprint, or TanStack. `classnames` is bundled.
export default defineConfig({
  plugins: [react()],
  // Don't copy `public/` (dev-app assets) into the published library bundle.
  publicDir: false,
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'if-function', 'color-functions', 'global-builtin', 'legacy-js-api'],
      },
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'blueprintjs-react-table.js' : 'blueprintjs-react-table.cjs'),
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@blueprintjs/core',
        '@blueprintjs/icons',
        '@tanstack/react-table',
        '@tanstack/react-virtual',
      ],
      output: {
        // Vite 5 has no `lib.cssFileName` (added in Vite 6), so rename the
        // single extracted stylesheet asset here.
        assetFileNames: (assetInfo) => (assetInfo.name === 'style.css' ? 'styles.css' : '[name][extname]'),
      },
    },
    sourcemap: true,
  },
});
