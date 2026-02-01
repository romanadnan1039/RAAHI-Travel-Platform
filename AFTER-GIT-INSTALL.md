# ✅ After Installing Git - Continue Here

Once Git is installed, follow these steps to deploy RAAHI:

---

## **🔄 Step 1: Verify Git Installation**

1. **Close ALL PowerShell windows**
2. **Open a NEW PowerShell** in `C:\Users\PMLS\Desktop\RAAHI_FYP`
3. Run this command to verify:

```powershell
git --version
```

You should see: `git version 2.xx.x`

✅ If you see the version, Git is installed! Continue below.
❌ If you see an error, restart your computer and try again.

---

## **📁 Step 2: Create GitHub Account & Repository**

### Create GitHub Account (if you don't have one):

1. Go to: **https://github.com/signup**
2. Enter your email
3. Create a password
4. Choose a username
5. Verify your email
6. ✅ Account created!

### Create Repository:

1. Go to: **https://github.com/new**
2. Fill in:
   - **Repository name:** `RAAHI-Travel-Platform`
   - **Description:** "AI-powered travel marketplace platform - FYP"
   - **Visibility:** ☑️ **PUBLIC** (very important!)
   - **DON'T** check "Add a README file"
   - **DON'T** add .gitignore or license
3. Click **"Create repository"**
4. **LEAVE THIS PAGE OPEN** - you'll need it

---

## **⬆️ Step 3: Push Code to GitHub**

In PowerShell (`C:\Users\PMLS\Desktop\RAAHI_FYP`), run this script:

```powershell
powershell -ExecutionPolicy Bypass -File "1-push-to-github.ps1"
```

The script will:
- ✅ Initialize Git repository
- ✅ Configure your Git username/email
- ✅ Add all files
- ✅ Create a commit
- ✅ Push to GitHub

**When prompted for your GitHub username, enter it exactly as shown on GitHub.**

---

## **🚂 Step 4: Deploy to Railway (Backend + Database)**

### 4.1 Sign Up for Railway

1. Go to: **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Choose **"Login with GitHub"**
4. Click **"Authorize Railway"**
5. ✅ You're in!

### 4.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Click on **"RAAHI-Travel-Platform"**
4. Railway will start deploying... ⏳

### 4.3 Add PostgreSQL Database

1. In your Railway project, click **"+ New"** (top right)
2. Select **"Database"**
3. Click **"Add PostgreSQL"**
4. Wait for database to provision (30 seconds)
5. Click on the **PostgreSQL** service
6. Go to **"Variables"** tab
7. **COPY THE ENTIRE `DATABASE_URL`** (click the copy icon)

### 4.4 Configure Backend Service

1. Click on the other service (your main app, not PostgreSQL)
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add these ONE BY ONE:

```
NODE_ENV=production
```

```
PORT=5000
```

```
JWT_SECRET=raahi-super-secret-jwt-key-2024-change-in-production
```

```
DATABASE_URL=[PASTE the DATABASE_URL you copied from PostgreSQL]
```

4. Go to **"Settings"** tab
5. Scroll to **"Service Settings"**
6. Set **"Root Directory"**: `backend`
7. Set **"Start Command"**: `npm install && npx prisma generate && npm run build && npm start`
8. Click **"Deploy"** (bottom of page)
9. Wait 2-3 minutes for deployment ⏳

### 4.5 Get Backend URL

1. In Railway, click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Networking"**
4. You'll see a URL like: `raahi-backend-production-xxxx.up.railway.app`
5. **COPY THIS URL** - save it in Notepad!

**Your Backend URL:**
```
https://raahi-backend-production-xxxx.up.railway.app
```

### 4.6 Seed the Database

1. Click on your backend service in Railway
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. Click **"View Logs"**
5. If you see "Server running on port 5000", it's ready!
6. Now go to **"Settings"** → Scroll down → Click **"Generate Domain"** (if not already done)
7. Open a new tab and go to: `https://YOUR-BACKEND-URL.up.railway.app/health`
8. You should see `{"status":"ok"}`

**Seed the database:**
- In Railway dashboard, click your backend service
- Click the **terminal icon** (top right) or go to "Settings" → "Service Settings" → Enable "Terminal"
- Wait for terminal to load
- Run these commands:

```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

Wait for seeding to complete (2-3 minutes). You'll see "✅ Seeding completed!"

---

## **🤖 Step 5: Deploy AI Agent to Railway**

### 5.1 Get OpenAI API Key

1. Go to: **https://platform.openai.com/api-keys**
2. Sign up or log in
3. Click **"Create new secret key"**
4. Name it: "RAAHI-Production"
5. **COPY THE KEY** - you can't see it again!
6. Save it in Notepad

### 5.2 Add AI Agent Service

1. In your Railway project (same project), click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose **"RAAHI-Travel-Platform"** again
4. Railway will create a second service

### 5.3 Configure AI Agent

1. Click on this new service
2. Go to **"Variables"** tab
3. Add these variables ONE BY ONE:

```
NODE_ENV=production
```

```
PORT=5001
```

```
BACKEND_URL=[PASTE your backend URL from Step 4.5]
```

```
OPENAI_API_KEY=[PASTE your OpenAI API key from Step 5.1]
```

4. Go to **"Settings"** tab
5. Set **"Root Directory"**: `ai-agent`
6. Set **"Start Command"**: `npm install && npm run build && npm start`
7. Click **"Deploy"**
8. Wait 2 minutes ⏳

### 5.4 Get AI Agent URL

1. Go to **"Settings"** → **"Networking"**
2. Copy the URL (e.g., `https://raahi-ai-agent-production-xxxx.up.railway.app`)
3. **SAVE THIS URL** in Notepad!

**Your AI Agent URL:**
```
https://raahi-ai-agent-production-xxxx.up.railway.app
```

---

## **▲ Step 6: Deploy Frontend to Vercel**

### 6.1 Sign Up for Vercel

1. Go to: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Click **"Authorize Vercel"**
4. ✅ You're in!

### 6.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find **"RAAHI-Travel-Platform"** in the list
3. Click **"Import"**

### 6.3 Configure Project

**Framework Preset:** Vite (should auto-detect)

**Build and Output Settings:**
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Environment Variables:** Click "Add" and enter these ONE BY ONE:

**Variable 1:**
- **Name:** `VITE_API_URL`
- **Value:** [PASTE your backend URL from Step 4.5]

**Variable 2:**
- **Name:** `VITE_AI_AGENT_URL`
- **Value:** [PASTE your AI agent URL from Step 5.4]

**Variable 3:**
- **Name:** `VITE_WS_URL`
- **Value:** [Backend URL but replace `https://` with `wss://`]

**Example:**
```
VITE_API_URL=https://raahi-backend-production.up.railway.app
VITE_AI_AGENT_URL=https://raahi-ai-agent-production.up.railway.app
VITE_WS_URL=wss://raahi-backend-production.up.railway.app
```

### 6.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes ⏳
3. You'll see "Congratulations!" 🎉
4. **COPY YOUR VERCEL URL** (e.g., `https://raahi-travel-platform.vercel.app`)

**Your Live URL:**
```
https://raahi-travel-platform-xxxx.vercel.app
```

---

## **🔐 Step 7: Update CORS Settings**

1. Go back to **Railway**
2. Click on your **Backend** service (not AI agent)
3. Go to **"Variables"** tab
4. Click **"New Variable"**:
   - **Name:** `FRONTEND_URL`
   - **Value:** [PASTE your Vercel URL from Step 6.4]
5. Go to **"Settings"** → Click **"Redeploy"**
6. Wait 1 minute

---

## **🎉 DONE! YOUR APP IS LIVE!**

### **Your Live Website:**
```
🌐 https://raahi-travel-platform-xxxx.vercel.app
```

### **Test It:**

1. Open your Vercel URL in any browser
2. Login as **Tourist:**
   - Email: `tourist1@example.com`
   - Password: `password123`
3. Test features:
   - ✅ Browse packages
   - ✅ Use filters (destination, price, duration)
   - ✅ Chat with AI agent
   - ✅ Create a booking

4. Login as **Agency:**
   - Email: `agency1@example.com`
   - Password: `password123`
5. Test:
   - ✅ View dashboard
   - ✅ Manage packages
   - ✅ See bookings

---

## **📱 Share Your Project!**

Share this message:

```
🚀 Check out my FYP: RAAHI - AI Travel Platform

🌐 Live Demo: https://your-url.vercel.app

✨ Features:
• AI Travel Assistant
• Smart Package Recommendations
• Real-time Bookings
• Agency Management

Try it:
📧 tourist1@example.com
🔑 password123
```

---

## **💰 Cost Breakdown**

- ✅ **Vercel:** FREE (forever)
- ✅ **Railway:** FREE ($5 credit/month, your app uses ~$3)
- ⚠️ **OpenAI:** ~$0.50-$2/month (pay as you go)

**Total: FREE** (within Railway's free tier)

---

## **🆘 Troubleshooting**

### Can't push to GitHub?
- Make sure you created the repository on GitHub first
- Check your GitHub username is correct
- Try running: `git push -u origin main` manually

### Railway deployment failed?
- Check logs in Railway Dashboard → Service → "Logs"
- Make sure all environment variables are set correctly
- Try redeploying from "Settings"

### Vercel build failed?
- Check environment variables are correct
- Make sure Root Directory is set to `frontend`
- Check build logs for specific errors

### Frontend can't connect to backend?
- Verify `VITE_API_URL` in Vercel matches your Railway backend URL
- Make sure `FRONTEND_URL` is set in Railway backend variables
- Redeploy both services

### AI Agent not responding?
- Check OpenAI API key is valid
- Ensure you have credits: https://platform.openai.com/usage
- Check Railway AI agent logs

---

## **✅ All URLs Checklist**

Save these URLs for your FYP report:

- [ ] **Backend:** `https://raahi-backend-production-xxxx.up.railway.app`
- [ ] **AI Agent:** `https://raahi-ai-agent-production-xxxx.up.railway.app`
- [ ] **Frontend:** `https://raahi-travel-platform-xxxx.vercel.app`
- [ ] **GitHub Repo:** `https://github.com/YOUR-USERNAME/RAAHI-Travel-Platform`

---

**Congratulations! Your FYP is now live on the internet! 🌍**

You can access it from anywhere, share it with anyone, and include the URL in your CV/resume! 🎓

---

**Need help with any step? Just ask!** 🚀
