/** Comma-separated FRONTEND_URL values (e.g. production + preview Vercel URLs). */
export function getAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173'
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}
