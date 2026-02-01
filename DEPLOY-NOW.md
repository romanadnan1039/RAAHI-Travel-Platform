# 🚀 Quick Deploy Guide - Make RAAHI Live in 15 Minutes!

## **What You'll Get**
A public URL like: `https://raahi-travel.vercel.app` that anyone can access!

---

## **📋 Quick Steps**

### **1️⃣ Push to GitHub (2 minutes)**

Open PowerShell in `C:\Users\PMLS\Desktop\RAAHI_FYP` and run:

```powershell
# Initialize Git (if not done)
git init
git add .
git commit -m "RAAHI Travel Platform - FYP"

# Create repo on GitHub:
# Go to https://github.com/new
# Name: RAAHI-Travel-Platform
# Make it PUBLIC
# Don't initialize with README

# Push to GitHub (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/RAAHI-Travel-Platform.git
git branch -M main
git push -u origin main
```

---

### **2️⃣ Deploy Backend + Database to Railway (5 minutes)**

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `RAAHI-Travel-Platform`
4. Click **"Add variables"** and paste:

```
NODE_ENV=production
JWT_SECRET=raahi-secret-key-2024-change-in-production
PORT=5000
```

5. In **Settings**:
   - **Root Directory**: `backend`
   - **Start Command**: `npm install && npx prisma generate && npm run build && npm start`

6. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
7. Copy the `DATABASE_URL` from PostgreSQL service → Variables tab
8. Go back to Backend service → Variables → Add:
```
DATABASE_URL=[paste the copied DATABASE_URL]
```

9. Open Railway Backend Terminal and run:
```bash
cd backend && npx prisma migrate deploy && npm run prisma:seed
```

10. **Copy your backend URL** (e.g., `https://raahi-backend-production.up.railway.app`)

---

### **3️⃣ Deploy AI Agent to Railway (3 minutes)**

1. In same Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select `RAAHI-Travel-Platform` again
3. Add variables:

```
NODE_ENV=production
PORT=5001
BACKEND_URL=[paste backend URL from step 2]
OPENAI_API_KEY=[your OpenAI API key from https://platform.openai.com/api-keys]
```

4. In **Settings**:
   - **Root Directory**: `ai-agent`
   - **Start Command**: `npm install && npm run build && npm start`

5. **Copy your AI Agent URL** (e.g., `https://raahi-ai-agent.up.railway.app`)

---

### **4️⃣ Deploy Frontend to Vercel (3 minutes)**

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import `RAAHI-Travel-Platform`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:

```
VITE_API_URL=[paste backend URL from step 2]
VITE_AI_AGENT_URL=[paste AI agent URL from step 3]
VITE_WS_URL=[backend URL but replace https:// with wss://]
```

**Example:**
```
VITE_API_URL=https://raahi-backend-production.up.railway.app
VITE_AI_AGENT_URL=https://raahi-ai-agent.up.railway.app
VITE_WS_URL=wss://raahi-backend-production.up.railway.app
```

6. Click **"Deploy"** → Wait 2 minutes

7. **Copy your Vercel URL** (e.g., `https://raahi-travel.vercel.app`)

---

### **5️⃣ Update CORS (2 minutes)**

1. Go back to Railway → Backend service → Variables
2. Add:
```
FRONTEND_URL=[paste your Vercel URL]
```

3. Click **"Redeploy"**

---

## **🎉 DONE! Your Website is LIVE!**

**Your Public URL:** `https://raahi-travel.vercel.app`

Test it:
- ✅ Open the URL in incognito mode
- ✅ Login: `tourist1@example.com` / `password123`
- ✅ Browse packages with filters
- ✅ Chat with AI agent
- ✅ Create a booking

**Share with anyone:**
- Friends, family, teachers
- On LinkedIn, Facebook, WhatsApp
- In your FYP report

---

## **💰 Cost**

- ✅ **Vercel**: 100% FREE forever
- ✅ **Railway**: FREE ($5 credit/month, your app uses ~$3)
- ⚠️ **OpenAI API**: ~$0.10-$2/month (pay as you go)

**Total: FREE** (within Railway's free tier)

---

## **🆘 Troubleshooting**

**Can't connect to backend?**
- Check Railway logs: Railway Dashboard → Backend → Logs
- Verify all environment variables are correct

**AI Agent not working?**
- Check your OpenAI API key is valid
- Ensure you have credits: https://platform.openai.com/usage

**Filters/Booking errors?**
- Make sure you ran the seed command in Railway terminal
- Check Railway PostgreSQL is running

---

## **📱 Share Your Project**

```
🚀 Check out my FYP: RAAHI Travel Platform
🌐 Live URL: https://raahi-travel.vercel.app
✨ Features:
   • AI Travel Assistant
   • Smart Package Recommendations
   • Real-time Bookings
   • Agency Management Dashboard
   
Login as Tourist:
📧 tourist1@example.com
🔑 password123
```

---

**Congratulations! Your app is now accessible worldwide! 🌍**

For detailed troubleshooting, see `DEPLOYMENT_GUIDE.md`
