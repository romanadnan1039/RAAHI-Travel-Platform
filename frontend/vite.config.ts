import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Vercel injects `process.env.VITE_*` at build time; merge with .env files so production never misses the API URL.
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const viteApi = process.env.VITE_API_URL ?? fileEnv.VITE_API_URL ?? ''
  const viteWs = process.env.VITE_WS_URL ?? fileEnv.VITE_WS_URL ?? ''
  const viteAi = process.env.VITE_AI_AGENT_URL ?? fileEnv.VITE_AI_AGENT_URL ?? ''

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(viteApi),
      'import.meta.env.VITE_WS_URL': JSON.stringify(viteWs),
      'import.meta.env.VITE_AI_AGENT_URL': JSON.stringify(viteAi),
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
