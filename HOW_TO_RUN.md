# 🚀 HOW TO RUN RAAHI - Step by Step Guide

## 📋 STEP-BY-STEP INSTRUCTIONS

### ✅ STEP 1: Check Prerequisites

First, let's check if you have everything installed:

```powershell
# Check Node.js
node --version

# Check npm
npm --version

# Check PostgreSQL (optional check)
psql --version
```

**If you see version numbers → Skip to Step 3**
**If you see errors → Continue to Step 2**

---

### 📥 STEP 2: Install Prerequisites

#### A. Install Node.js
1. Go to: **https://nodejs.org/**
2. Click the **green "Download Node.js (LTS)"** button
3. Run the installer (.msi file)
4. Click "Next" through all steps
5. **IMPORTANT:** After installation, **RESTART your terminal/IDE**

#### B. Install PostgreSQL
1. Go to: **https://www.postgresql.org/download/**
2. Download PostgreSQL for Windows
3. Install it (remember your password!)
4. During installation, note the port (usually 5432)

#### C. Create Database
1. Open **pgAdmin** (comes with PostgreSQL) OR use command line
2. Create database:
   ```sql
   CREATE DATABASE raahi_db;
   ```
   
   **OR using command line:**
   ```powershell
   createdb raahi_db
   ```

---

### ⚙️ STEP 3: Configure Environment Files

#### Create `backend/.env` file:

1. Navigate to `backend` folder
2. Create a new file named `.env`
3. Add this content (replace YOUR_PASSWORD with your PostgreSQL password):

```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/raahi_db

JWT_SECRET=raahi-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=raahi-refresh-secret-key-2024
JWT_REFRESH_EXPIRES_IN=30d

FRONTEND_URL=http://localhost:5173

UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp

AI_AGENT_URL=http://localhost:5001

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Create `frontend/.env` file:

1. Navigate to `frontend` folder
2. Create a new file named `.env`
3. Add this content:

```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_AGENT_URL=http://localhost:5001
VITE_WS_URL=ws://localhost:5000
```

#### Create `ai-agent/.env` file:

1. Navigate to `ai-agent` folder
2. Create a new file named `.env`
3. Add this content (OpenAI key is optional - AI features won't work without it):

```env
NODE_ENV=development
PORT=5001
AI_AGENT_URL=http://localhost:5001

BACKEND_API_URL=http://localhost:5000/api

OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
```

---

### 🚀 STEP 4: Run the Project

#### **OPTION A: Automatic (Recommended)**

Just run this one command in PowerShell:

```powershell
.\setup-and-run.ps1
```

This will:
- ✅ Install all dependencies
- ✅ Set up database
- ✅ Seed with Pakistani data
- ✅ Start all 3 services
- ✅ Open browser automatically

#### **OPTION B: Manual Step-by-Step**

**Terminal 1 - Install Backend Dependencies:**
```powershell
cd backend
npm install
```

**Terminal 2 - Install Frontend Dependencies:**
```powershell
cd frontend
npm install
```

**Terminal 3 - Install AI Agent Dependencies:**
```powershell
cd ai-agent
npm install
```

**Then Setup Database:**
```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

**Then Start Services (3 separate terminals):**

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Wait for: `Server running on port 5000`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Wait for: `Local: http://localhost:5173`

**Terminal 3 - AI Agent:**
```powershell
cd ai-agent
npm run dev
```
Wait for: `AI Agent server running on port 5001`

---

### 🌐 STEP 5: Access the Application

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the login page!

---

### 🔑 STEP 6: Test the Application

**Test Accounts (after database is seeded):**

**Tourist Login:**
- Email: `tourist1@example.com`
- Password: `password123`

**Agency Login:**
- Email: `ahmed@adventurepakistan.com`
- Password: `password123`

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ **Backend terminal shows:**
   ```
   [INFO] Server running on port 5000
   ```

2. ✅ **Frontend terminal shows:**
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

3. ✅ **AI Agent terminal shows:**
   ```
   AI Agent server running on port 5001
   ```

4. ✅ **Browser shows:** Login page with Tourist/Agency options

---

## 🆘 Troubleshooting

### "node is not recognized"
**Solution:**
- Install Node.js from https://nodejs.org/
- **RESTART your terminal/IDE**
- Verify: `node --version`

### "Database connection error"
**Solution:**
- Make sure PostgreSQL is running
- Check your password in `backend/.env` (DATABASE_URL)
- Verify database `raahi_db` exists
- Test connection: `psql -U postgres -d raahi_db`

### "Port already in use"
**Solution:**
- Change PORT in `.env` files
- Or stop other services using ports 5000, 5001, 5173
- Check: `netstat -ano | findstr :5000`

### "npm install failed"
**Solution:**
- Check internet connection
- Try: `npm cache clean --force`
- Try: `npm install --legacy-peer-deps`

### "Prisma errors"
**Solution:**
- Make sure PostgreSQL is running
- Check DATABASE_URL is correct
- Try: `npx prisma generate` again
- Try: `npx prisma migrate reset` (WARNING: deletes data)

### "OpenAI API error"
**Solution:**
- Add valid API key to `ai-agent/.env`
- Get key from: https://platform.openai.com/api-keys
- Note: AI features won't work without valid key, but rest of app will work

---

## 📞 Quick Reference

**Start everything:**
```powershell
.\setup-and-run.ps1
```

**Check setup:**
```powershell
.\check-setup.ps1
```

**Manual start (3 terminals):**
```powershell
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev

# Terminal 3
cd ai-agent && npm run dev
```

**Access app:**
- URL: http://localhost:5173
- Backend API: http://localhost:5000/api
- AI Agent: http://localhost:5001

---

## 🎉 You're Ready!

Follow these steps and your RAAHI Travel Marketplace will be running!

For more help, see:
- `START_HERE.md` - Quick start
- `RUN.md` - Detailed instructions
- `SETUP.md` - Complete setup guide
