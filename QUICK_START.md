# 🚀 Quick Start Guide

## Prerequisites
1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v14+) - [Download](https://www.postgresql.org/download/)

## One-Command Setup & Run

Simply run:
```powershell
.\setup-and-run.ps1
```

This script will:
- ✅ Install all dependencies
- ✅ Set up database schema
- ✅ Seed database with Pakistani travel data
- ✅ Start all three services

## Manual Setup (if script doesn't work)

### 1. Install Dependencies
```powershell
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd ai-agent && npm install && cd ..
```

### 2. Set Up Database
```powershell
# Make sure PostgreSQL is running and create database
createdb raahi_db

# Or using psql:
# CREATE DATABASE raahi_db;

# Then run migrations
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
cd ..
```

### 3. Update Environment Files

**backend/.env** - Update DATABASE_URL:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/raahi_db
```

**ai-agent/.env** - Add OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### 4. Start Services

**Option A: Use the script**
```powershell
.\start-all.ps1
```

**Option B: Manual (3 terminals)**
```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev

# Terminal 3
cd ai-agent
npm run dev
```

## Access the Application

Open browser: **http://localhost:5173**

## Test Accounts

After seeding:
- **Tourist**: `tourist1@example.com` / `password123`
- **Agency**: `ahmed@adventurepakistan.com` / `password123`

## Troubleshooting

### "node is not recognized"
- Install Node.js from nodejs.org
- Restart terminal/IDE

### Database connection error
- Check PostgreSQL is running
- Verify DATABASE_URL in backend/.env
- Make sure database `raahi_db` exists

### Port already in use
- Change PORT in .env files
- Or stop the service using that port

### OpenAI API errors
- Add valid API key to ai-agent/.env
- Check you have OpenAI credits
