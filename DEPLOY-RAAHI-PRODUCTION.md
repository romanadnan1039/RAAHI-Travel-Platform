# RAAHI production deploy (Vercel + Railway)

Use this after `main` is pushed to GitHub. Order matters: **database → backend → AI agent → wire URLs → frontend**.

---

## 1. Railway — PostgreSQL

- Add **PostgreSQL** to the project; copy **`DATABASE_URL`** from the database service **Variables**.

---

## 2. Railway — Backend (`backend/`)

| Variable | Example / notes |
|----------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Railway may set this automatically) |
| `JWT_SECRET` | Long random string |
| `DATABASE_URL` | From step 1 |
| `FRONTEND_URL` | Your **Vercel** site URL, e.g. `https://your-app.vercel.app` (CORS) |
| `AI_AGENT_URL` | **HTTPS** URL of the AI agent service (step 3), no `/api` suffix |

**Service settings**

- **Root Directory**: `backend`
- Build/start are driven by `backend/railway.json` (Prisma generate + build + `npm start`).

**After first deploy**, open Railway **Shell** for the backend:

```bash
npx prisma migrate deploy
npm run prisma:seed
```

(Use the project’s actual seed script name if different.)

**Copy the public URL** of the backend (e.g. `https://xxx.up.railway.app`).

**Smoke test**

- `GET https://<backend>/health`
- `GET https://<backend>/api/ai/status` → should show `"available": true` **after** the AI agent is up and `AI_AGENT_URL` is correct.

---

## 3. Railway — AI agent (`ai-agent/`)

| Variable | Example / notes |
|----------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | `5001` |
| `BACKEND_URL` | Backend public URL **without** `/api`, e.g. `https://xxx.up.railway.app` |

**Service settings**

- **Root Directory**: `ai-agent`
- Uses `ai-agent/railway.json`.

**Networking**: **Generate domain** so the agent has a public HTTPS URL.

**Smoke test**

- `GET https://<ai-agent>/health` → JSON with `"status": "ok"`

---

## 4. Backend — point `AI_AGENT_URL` at the agent

In Railway **Backend** → **Variables**, set:

```text
AI_AGENT_URL=https://<your-ai-agent-host>.up.railway.app
```

Redeploy backend if it was deployed before this variable existed. Confirm again:

```text
GET https://<backend>/api/ai/status
```

Expect `"available": true`.

---

## 5. Vercel — Frontend (`frontend/`)

**Import** the GitHub repo. Configure:

| Setting | Value |
|---------|--------|
| Framework | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment variables** (Production — **redeploy** after any change):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://<backend>.up.railway.app/api` (must end with `/api` or base host; app normalizes to `/api`) |
| `VITE_WS_URL` | `wss://<backend>.up.railway.app` or `https://<backend>.up.railway.app` per your socket setup |
| `VITE_AI_AGENT_URL` | Optional; only if the frontend references the agent directly. Chat goes **through** the backend, so API + WS are the critical pair. |

See also `frontend/env.production.template`.

---

## 6. Final checks

| Check | OK if |
|-------|--------|
| Login / packages load | `VITE_API_URL` matches production backend |
| Assistant shows **Ready** | `/api/ai/status` → `available: true` |
| Assistant replies | AI agent running + backend `AI_AGENT_URL` correct |
| No localhost in prod build | Vercel env vars set **before** last build |

---

## Troubleshooting

- **Assistant offline / `available: false`**: AI agent not running, wrong `AI_AGENT_URL`, or firewall — fix agent URL and redeploy backend.
- **CORS errors**: Set `FRONTEND_URL` on the backend to the exact Vercel URL (including `https://`).
- **401 on chat**: User must be logged in as **tourist**; `/api/ai/chat` is protected.

Repository: `https://github.com/romanadnan1039/RAAHI-Travel-Platform`
