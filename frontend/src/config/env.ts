/** Central place for client env. Vite injects `VITE_*` at build time (set them on Vercel). */

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
}

export function getWsUrl(): string {
  return import.meta.env.VITE_WS_URL || 'http://localhost:5000'
}

/**
 * True when this is a production build but no real API URL was baked in
 * (Vercel missing `VITE_API_URL` → browser tries localhost and fails).
 */
export function isApiMisconfiguredForProduction(): boolean {
  if (!import.meta.env.PROD) return false
  const raw = import.meta.env.VITE_API_URL
  if (raw == null || String(raw).trim() === '') return true
  const u = String(raw).toLowerCase()
  return u.includes('localhost') || u.includes('127.0.0.1')
}
