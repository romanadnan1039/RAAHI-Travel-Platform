# 🚀 RAAHI Deployment Guide

This guide will help you deploy RAAHI so anyone can access it online via a public URL.

## 📋 **Prerequisites**

1. **GitHub Account** (free) - https://github.com/signup
2. **Vercel Account** (free) - https://vercel.com/signup
3. **Railway Account** (free) - https://railway.app
4. **OpenAI API Key** (paid, ~$5 credit to start) - https://platform.openai.com/api-keys

---

## 🌐 **Deployment Architecture**

- **Frontend (React)** → Vercel (Free)
- **Backend (Express)** → Railway (Free tier: $5 credit/month)
- **AI Agent (Node.js)** → Railway (Free tier)
- **Database (PostgreSQL)** → Railway (Free tier)

**Total Cost:** FREE (Railway gives $5 free credit monthly)

---

## 📝 **Step-by-Step Deployment**

### **STEP 1: Push Code to GitHub**

1. Open a terminal in `C:\Users\PMLS\Desktop\RAAHI_FYP`

2. Initialize Git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - RAAHI FYP"
```

3. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it: `RAAHI-Travel-Platform`
   - Make it **Public** (so Vercel/Railway can access it)
   - **Don't** initialize with README (you already have one)

4. Push your code:
```bash
git remote add origin https://github.com/YOUR-USERNAME/RAAHI-Travel-Platform.git
git branch -M main
git push -u origin main
```

---

### **STEP 2: Deploy Database & Backend to Railway**

#### 2.1 Sign Up & Create Project

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Connect your GitHub account
5. Select your `RAAHI-Travel-Platform` repository

#### 2.2 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a database instance
4. Click on the database → **"Variables"** tab
5. **Copy the `DATABASE_URL`** (you'll need this)

#### 2.3 Deploy Backend

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Click **"Add variables"** and add these:

```env
NODE_ENV=production
DATABASE_URL=[paste the DATABASE_URL from step 2.2]
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
AI_AGENT_URL=https://raahi-ai-agent.up.railway.app
```

4. In **"Settings"** → **"Start Command"**, set:
```bash
cd backend && npm install && npm run prisma:generate && npm run build && npm run start
```

5. In **"Settings"** → **"Root Directory"**, set: `backend`

6. Click **"Deploy"**

7. Once deployed, copy the backend URL (e.g., `https://raahi-backend-production.up.railway.app`)

#### 2.4 Run Database Migrations

1. In Railway, click on your backend service
2. Go to **"Settings"** → **"Variables"**
3. Click **"+ New Variable"**
4. Add:
```env
MIGRATE_ON_START=true
```

5. Redeploy the backend

6. To seed the database, go to Railway Dashboard → Backend Service → "Terminal" tab, run:
```bash
cd backend && npx prisma migrate deploy && npm run prisma:seed
```

#### 2.5 Deploy AI Agent

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Add these variables:

```env
NODE_ENV=production
PORT=5001
BACKEND_URL=[paste your backend URL from 2.3 step 7]
OPENAI_API_KEY=[your OpenAI API key]
```

4. In **"Settings"** → **"Start Command"**, set:
```bash
cd ai-agent && npm install && npm run build && npm run start
```

5. In **"Settings"** → **"Root Directory"**, set: `ai-agent`

6. Click **"Deploy"**

7. Copy the AI Agent URL (e.g., `https://raahi-ai-agent.up.railway.app`)

---

### **STEP 3: Deploy Frontend to Vercel**

#### 3.1 Sign Up & Import Project

1. Go to https://vercel.com/signup
2. Sign up with your GitHub account
3. Click **"Add New..."** → **"Project"**
4. Import your `RAAHI-Travel-Platform` repository

#### 3.2 Configure Build Settings

1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

#### 3.3 Add Environment Variables

In Vercel project settings → **"Environment Variables"**, add:

```env
VITE_API_URL=[paste your Railway backend URL from step 2.3]
VITE_AI_AGENT_URL=[paste your Railway AI agent URL from step 2.5]
VITE_WS_URL=[paste your Railway backend URL, but replace https:// with wss://]
```

**Example:**
```env
VITE_API_URL=https://raahi-backend-production.up.railway.app
VITE_AI_AGENT_URL=https://raahi-ai-agent.up.railway.app
VITE_WS_URL=wss://raahi-backend-production.up.railway.app
```

#### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://raahi-travel-platform.vercel.app`

---

### **STEP 4: Update Backend CORS**

1. Go back to Railway → Backend Service → **"Variables"**
2. Update `FRONTEND_URL` to your actual Vercel URL:
```env
FRONTEND_URL=https://raahi-travel-platform.vercel.app
```

3. Redeploy backend

---

### **STEP 5: Test Your Deployment**

1. Open your Vercel URL: `https://raahi-travel-platform.vercel.app`

2. Test login with default credentials:
   - **Tourist:** `tourist1@example.com` / `password123`
   - **Agency:** `agency1@example.com` / `password123`

3. Test features:
   - ✅ Browse packages
   - ✅ Use filters
   - ✅ Chat with AI agent
   - ✅ Create bookings
   - ✅ Agency dashboard

---

## 🎉 **You're Live!**

Share your URL with anyone:
```
https://raahi-travel-platform.vercel.app
```

---

## 💰 **Cost Breakdown**

- **Vercel**: 100% FREE (unlimited bandwidth, automatic HTTPS, custom domains)
- **Railway**: FREE ($5 credit/month) - Your app likely uses $3-4/month
- **OpenAI API**: ~$0.10-$2/month depending on usage (pay as you go)

**Total:** ~$0-2/month (within Railway's free credit)

---

## 🔧 **Troubleshooting**

### Issue: "Failed to connect to backend"
- Check Railway backend logs for errors
- Verify `VITE_API_URL` in Vercel environment variables
- Ensure `FRONTEND_URL` in Railway backend matches your Vercel URL

### Issue: "AI Agent not responding"
- Check Railway AI Agent logs
- Verify `OPENAI_API_KEY` is set correctly
- Ensure `AI_AGENT_URL` in Vercel environment variables is correct

### Issue: "Database connection failed"
- Check Railway PostgreSQL is running
- Verify `DATABASE_URL` in backend environment variables
- Run migrations: `npx prisma migrate deploy` in Railway backend terminal

### Issue: "CORS errors in browser"
- Update `FRONTEND_URL` in Railway backend to match Vercel URL exactly
- Redeploy backend after updating

---

## 📱 **Custom Domain (Optional)**

### Add Custom Domain to Vercel:

1. Buy a domain (e.g., `raahi.app` from Namecheap, GoDaddy)
2. In Vercel → Project Settings → **"Domains"**
3. Add your domain: `raahi.app`
4. Follow Vercel's DNS instructions
5. Wait 24-48 hours for DNS propagation

---

## 🔒 **Security Checklist**

Before going live:

- ✅ Change `JWT_SECRET` to a strong random string
- ✅ Enable rate limiting (already configured)
- ✅ Use environment variables (never commit secrets)
- ✅ Review CORS settings
- ✅ Set up database backups in Railway
- ✅ Monitor Railway logs for errors

---

## 📊 **Monitoring**

- **Railway Dashboard**: View logs, metrics, and usage
- **Vercel Analytics**: Track page views and performance
- **OpenAI Usage Dashboard**: Monitor API costs

---

## 🆘 **Need Help?**

If you encounter issues:

1. Check Railway logs: Railway Dashboard → Service → "Logs" tab
2. Check Vercel deployment logs: Vercel Dashboard → Project → "Deployments"
3. Check browser console for frontend errors (F12)
4. Verify all environment variables are set correctly

---

## 🚀 **Next Steps After Deployment**

1. Share your URL on social media
2. Add Google Analytics (optional)
3. Set up error monitoring (e.g., Sentry)
4. Create user documentation
5. Present your FYP! 🎓

---

**Good luck with your deployment! 🌟**

If you need help with any step, just ask!
