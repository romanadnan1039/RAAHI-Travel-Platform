# 🚂 Railway Deployment Checklist

## ✅ What We've Done So Far

- [x] Fixed `backend/railway.json` with proper build commands
- [x] Fixed `ai-agent/railway.json` with proper build commands
- [x] Moved TypeScript to production dependencies
- [x] Pushed changes to GitHub
- [x] Railway auto-deployment triggered

---

## 📋 Next Steps - Follow This Order

### **Step 1: Verify Railway Deployment Status** ⏳

Go to: **https://railway.app/dashboard**

#### **Check Backend Service:**
1. Click on your **Backend** service
2. Go to **Deployments** tab
3. Wait for the latest deployment to show: ✅ **"Success"**
4. If it shows ❌ **"Failed"**, click it and check the logs

#### **Check AI Agent Service:**
1. Click on your **AI Agent** service
2. Go to **Deployments** tab
3. Wait for the latest deployment to show: ✅ **"Success"**
4. If it shows ❌ **"Failed"**, click it and check the logs

---

### **Step 2: Verify Environment Variables** 🔑

#### **Backend Service Variables (Required):**
```
NODE_ENV=production
JWT_SECRET=raahi-secret-key-2024-change-in-production
PORT=5000
DATABASE_URL=[Copy from PostgreSQL service Variables tab]
FRONTEND_URL=[Will add after Vercel deployment]
```

**How to check:**
- Railway Dashboard → Backend Service → **Variables** tab
- Make sure all above variables exist
- `DATABASE_URL` should start with `postgresql://`

#### **AI Agent Service Variables (Required):**
```
NODE_ENV=production
PORT=5001
BACKEND_URL=[Your backend Railway URL]
OPENAI_API_KEY=[Your OpenAI API key]
```

**How to check:**
- Railway Dashboard → AI Agent Service → **Variables** tab
- Make sure all above variables exist
- `OPENAI_API_KEY` should start with `sk-`

---

### **Step 3: Get Your Service URLs** 🔗

#### **Backend URL:**
1. Go to Backend service → **Settings** tab
2. Scroll to **Domains** section
3. Copy the URL (e.g., `https://raahi-backend-production.up.railway.app`)
4. **Save this URL** - you'll need it!

#### **AI Agent URL:**
1. Go to AI Agent service → **Settings** tab
2. Scroll to **Domains** section
3. Copy the URL (e.g., `https://raahi-ai-agent.up.railway.app`)
4. **Save this URL** - you'll need it!

---

### **Step 4: Test Your Backend** 🧪

Open in browser:
```
[Your Backend URL]/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T..."
}
```

If you get an error, check Railway logs:
- Backend Service → **Deployments** → Click latest → **View Logs**

---

### **Step 5: Deploy Frontend to Vercel** 🎨

1. Go to **https://vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. Click **"Import"** on `RAAHI-Travel-Platform`

#### **Configure Project:**
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

#### **Add Environment Variables:**
```
VITE_API_URL=[Your Backend Railway URL]
VITE_AI_AGENT_URL=[Your AI Agent Railway URL]
VITE_WS_URL=[Backend URL but replace https:// with wss://]
```

**Example:**
```
VITE_API_URL=https://raahi-backend-production.up.railway.app
VITE_AI_AGENT_URL=https://raahi-ai-agent.up.railway.app
VITE_WS_URL=wss://raahi-backend-production.up.railway.app
```

5. Click **"Deploy"**
6. Wait 2-3 minutes
7. Copy your Vercel URL (e.g., `https://raahi-travel.vercel.app`)

---

### **Step 6: Update Backend CORS** 🔒

1. Go back to Railway → **Backend Service** → **Variables**
2. Add new variable:
   ```
   FRONTEND_URL=[Your Vercel URL]
   ```
   Example: `https://raahi-travel.vercel.app`
3. Click **"Add"**
4. Backend will automatically redeploy

---

### **Step 7: Run Database Migrations & Seed** 💾

**Option A: Using Railway Dashboard**
1. Backend Service → **Deployments** → Latest deployment
2. Look for **"Logs"** - migrations should run automatically
3. Check for: `✓ Migrations applied successfully`

**Option B: Manual (if needed)**
1. Backend Service → Click **"..."** → **"Service Terminal"**
2. Run:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

---

### **Step 8: Test Your Live Website** 🎉

Open your Vercel URL in **incognito/private window**:

#### **Test Login:**
- Email: `tourist1@example.com`
- Password: `password123`

#### **Test Features:**
- ✅ Browse travel packages
- ✅ Use filters (destination, budget, rating)
- ✅ Click "Chat with AI" - send a message
- ✅ Try to create a booking
- ✅ Check notifications

---

## 🆘 Common Issues & Fixes

### **❌ Backend Build Failed**

**Check the logs for:**

1. **"Module not found: typescript"**
   - ✅ Already fixed! We moved typescript to dependencies

2. **"Prisma Client not generated"**
   - ✅ Already fixed! Added `npx prisma generate` to build command

3. **"DATABASE_URL not set"**
   - Go to Railway → Backend → Variables
   - Copy `DATABASE_URL` from PostgreSQL service
   - Add it to Backend service variables

### **❌ AI Agent Build Failed**

**Common causes:**
1. Missing `OPENAI_API_KEY`
2. Missing `BACKEND_URL`
3. TypeScript issues (already fixed!)

### **❌ Frontend Can't Connect to Backend**

1. Check CORS - make sure `FRONTEND_URL` is set in Backend
2. Verify `VITE_API_URL` in Vercel matches your Backend URL
3. Check Backend is running (visit `/health` endpoint)

### **❌ AI Chat Not Working**

1. Verify `OPENAI_API_KEY` is set in Railway AI Agent
2. Check you have OpenAI credits: https://platform.openai.com/usage
3. Verify `VITE_AI_AGENT_URL` in Vercel matches your AI Agent URL

### **❌ "No packages found"**

Database seed hasn't run:
1. Railway → Backend Service → Service Terminal
2. Run: `npx tsx prisma/seed.ts`
3. Refresh your website

---

## 📱 Share Your Project

Once everything works:

```
🚀 Check out my FYP: RAAHI Travel Platform
🌐 Live: https://raahi-travel.vercel.app
🔗 GitHub: https://github.com/romanadnan1039/RAAHI-Travel-Platform

✨ Features:
   • AI-powered travel recommendations
   • Real-time booking system
   • Agency management dashboard
   • Smart package filters
   
👤 Demo Login:
   Email: tourist1@example.com
   Password: password123
```

---

## 💰 Free Tier Limits

- **Vercel:** Unlimited (forever free for personal projects)
- **Railway:** $5/month free credit (~500 hours)
- **OpenAI API:** Pay as you go (~$0.10-$2/month for testing)

**Your project should stay FREE within Railway's free tier! 🎉**

---

## 🎯 Current Status Tracking

Update this as you go:

- [ ] Backend deployed successfully on Railway
- [ ] AI Agent deployed successfully on Railway
- [ ] Backend environment variables verified
- [ ] AI Agent environment variables verified
- [ ] Backend URL copied
- [ ] AI Agent URL copied
- [ ] Backend health check passed
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] CORS updated in Backend
- [ ] Database migrations run
- [ ] Database seeded with test data
- [ ] Tested login on live site
- [ ] Tested package browsing
- [ ] Tested AI chat
- [ ] Tested bookings
- [ ] **🎉 FULLY DEPLOYED & WORKING!**

---

**Need help?** Check the deployment logs in Railway and let me know the exact error message!
