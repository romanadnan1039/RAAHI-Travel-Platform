/** Central place for client env. Vite injects `VITE_*` at build time (set them on Vercel). */

/** Docs/examples use fake hostnames — if copied into Vercel, the app calls a non-existent server. */
const PLACEHOLDER_HOST = /(your-service|your-app|your-backend|changeme|placeholder|example\.com|xxxx\.up\.railway)/i

export function isPlaceholderViteApiUrl(): boolean {
  const raw = import.meta.env.VITE_API_URL
  if (raw == null || String(raw).trim() === '') return false
  return PLACEHOLDER_HOST.test(String(raw))
}

function normalizeApiBase(raw: string | undefined): string {
  const fallback = 'http://localhost:5000/api'
  if (raw == null || String(raw).trim() === '') return fallback
  let base = String(raw).trim().replace(/\/+$/, '')
  if (!base.endsWith('/api')) {
    base = `${base}/api`
  }
  return base
}

export function getApiBaseUrl(): string {
  return normalizeApiBase(import.meta.env.VITE_API_URL)
}

export function getWsUrl(): string {
  const raw = import.meta.env.VITE_WS_URL
  if (raw == null || String(raw).trim() === '') return 'http://localhost:5000'
  return String(raw).trim().replace(/\/+$/, '')
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
  if (u.includes('localhost') || u.includes('127.0.0.1')) return true
  return isPlaceholderViteApiUrl()
}
