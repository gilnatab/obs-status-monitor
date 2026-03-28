import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/obs-status-monitor/',
  server: {
    port: 5173,
  },
})
