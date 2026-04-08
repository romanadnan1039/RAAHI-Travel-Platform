/** Extract a user-facing message from axios / API errors. */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const ax = err as { response?: { data?: { error?: { message?: string; details?: unknown } } }; message?: string }
    const data = ax.response?.data
    const msg = data?.error?.message
    if (typeof msg === 'string' && msg.trim()) {
      const details = data?.error?.details
      if (Array.isArray(details) && details.length > 0) {
        const first = details[0] as { message?: string; path?: (string | number)[] }
        const path = first.path?.length ? `${first.path.join('.')}: ` : ''
        const sub = first.message
        if (sub && sub !== msg) return `${msg} — ${path}${sub}`
      }
      return msg
    }
  }
  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Start the backend (folder: backend → npm run dev) and ensure it runs on port 5000.'
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: string }).message
    if (m === 'Network Error') {
      return 'Cannot reach the server. Start the backend (folder: backend → npm run dev) and ensure it runs on port 5000.'
    }
  }
  return fallback
}
