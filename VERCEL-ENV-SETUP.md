# Fix “Failed to connect to server” on Vercel

The frontend is built with **Vite**: `VITE_*` values are **baked in at build time**. If they are missing or wrong, the live site still calls `localhost` or an old Railway URL → the browser cannot reach your backend.

## 0. Yellow banner on the site?

If you see **“API URL not set for production”**, the last Vercel build did not receive `VITE_API_URL`. Add the variables below and **Redeploy** (env changes apply only on a new build).

## Checklist (most common mistakes)

1. **Project → Settings → General → Root Directory** must be **`frontend`** if your repo is the monorepo (not only `frontend` files at repo root). If Root Directory is wrong, builds can succeed but env may not apply as expected.
2. **Variable names** must be exactly: `VITE_API_URL`, `VITE_WS_URL` (case-sensitive).
3. **Environment**: enable for **Production** (not only Preview). After any change, **Redeploy**.
4. **Value**: `VITE_API_URL` may be `https://YOUR-SERVICE.up.railway.app` **or** `https://YOUR-SERVICE.up.railway.app/api` — the app normalizes to always use `/api` as the API base path.

## 1. Vercel → Environment Variables

Open **Vercel** → your project → **Settings** → **Environment Variables**.

Set these for **Production** (and **Preview** if you use preview deployments):

| Name | Example value | Notes |
|------|-----------------|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND.up.railway.app/api` | Must end with `/api` (same path your Express app uses). |
| `VITE_WS_URL` | `wss://YOUR-BACKEND.up.railway.app` | Use `wss://` in production (HTTPS). Same host as API, **no** `/api`. |
| `VITE_AI_AGENT_URL` | `https://YOUR-AI-AGENT.up.railway.app` | Optional; only if AI agent is deployed. |

Replace `YOUR-BACKEND` with your **current** backend public URL (Railway dashboard → your service → **Networking** / **Public URL**).

## 2. Redeploy the frontend

After saving env vars, trigger a **new deployment**:

- **Deployments** → **⋯** on latest → **Redeploy** (or push a small commit).

Old builds keep the old embedded URLs until you rebuild.

## 3. Backend CORS (Railway / host)

On the **backend** service, set:

```env
FRONTEND_URL=https://raahi-travel-app.vercel.app,https://raahi-travel-platform-pqf6.vercel.app
```

- Use your **real** Vercel production domain(s), comma-separated if you have more than one.
- Redeploy backend after changing env.

## 4. Quick checks

- Open `https://YOUR-BACKEND/health` in a browser → should return JSON `status: ok`.
- Open browser **DevTools** → **Network** on your Vercel site → failed requests show the exact URL being called; it must **not** be `localhost`.
