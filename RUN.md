# 🚀 RUN RAAHI - Complete Instructions

## ⚡ FASTEST WAY - Run This Command:

```powershell
.\setup-and-run.ps1
```

This will do EVERYTHING automatically!

---

## 📋 What You Need First:

### 1. Install Node.js
- Download: https://nodejs.org/ (LTS version)
- Install it
- **Restart your terminal/IDE after installation**

### 2. Install PostgreSQL  
- Download: https://www.postgresql.org/download/
- Install it
- Remember your PostgreSQL password!

### 3. Create Database
Open PostgreSQL and run:
```sql
CREATE DATABASE raahi_db;
```

---

## 🔧 Manual Setup (If Script Doesn't Work):

### Step 1: Create Environment Files

**Create `backend/.env`:**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/raahi_db
JWT_SECRET=raahi-secret-key-2024
FRONTEND_URL=http://localhost:5173
AI_AGENT_URL=http://localhost:5001
```

**Create `frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_AGENT_URL=http://localhost:5001
VITE_WS_URL=ws://localhost:5000
```

**Create `ai-agent/.env`:**
```env
PORT=5001
BACKEND_API_URL=http://localhost:5000/api
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```

### Step 2: Install Dependencies

Open PowerShell and run:
```powershell
cd backend
npm install
cd ..\frontend
npm install
cd ..\ai-agent
npm install
```

### Step 3: Setup Database

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### Step 4: Start All Services

**Option A - Use Script:**
```powershell
.\start-all.ps1
```

**Option B - Manual (3 separate terminals):**

Terminal 1:
```powershell
cd backend
npm run dev
```

Terminal 2:
```powershell
cd frontend
npm run dev
```

Terminal 3:
```powershell
cd ai-agent
npm run dev
```

---

## 🌐 Access Application

Open browser: **http://localhost:5173**

---

## 🔑 Test Accounts

After database is seeded:
- **Tourist Login**: `tourist1@example.com` / `password123`
- **Agency Login**: `ahmed@adventurepakistan.com` / `password123`

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Backend shows: "Server running on port 5000"
- ✅ Frontend shows: "Local: http://localhost:5173"
- ✅ AI Agent shows: "AI Agent server running on port 5001"
- ✅ Browser opens and shows login page

---

## 🆘 Common Issues

**"node is not recognized"**
→ Install Node.js and restart terminal

**"Database connection error"**
→ Check PostgreSQL is running
→ Verify DATABASE_URL password in backend/.env

**"Port already in use"**
→ Change PORT in .env files
→ Or stop other services using ports 5000, 5001, 5173

**"OpenAI API error"**
→ Add valid API key to ai-agent/.env
→ Get key from: https://platform.openai.com/api-keys

---

## 📞 Need Help?

Check `SETUP.md` for detailed instructions or `QUICK_START.md` for quick reference.
