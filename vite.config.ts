import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'if-function', 'color-functions', 'global-builtin', 'legacy-js-api'],
      },
    },
  },
})
