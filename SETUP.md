# Quick Setup Guide for RAAHI

## Prerequisites Check

Before starting, make sure you have:
1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
3. **npm** (comes with Node.js)

## Step-by-Step Setup

### Step 1: Install Node.js Dependencies

Open **3 separate terminal windows** and run:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

**Terminal 3 - AI Agent:**
```bash
cd ai-agent
npm install
```

### Step 2: Set Up PostgreSQL Database

1. **Start PostgreSQL** (if not running)
2. **Create the database:**
   ```sql
   CREATE DATABASE raahi_db;
   ```

   Or using command line:
   ```bash
   createdb raahi_db
   ```

### Step 3: Configure Backend Environment

1. **Create `.env` file in `backend/` folder:**
   ```env
   NODE_ENV=development
   PORT=5000
   API_URL=http://localhost:5000
   
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/raahi_db
   
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRES_IN=30d
   
   FRONTEND_URL=http://localhost:5173
   
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=jpg,jpeg,png,webp
   
   AI_AGENT_URL=http://localhost:5001
   
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **Important:** Replace `your_password` with your PostgreSQL password!

### Step 4: Set Up Database Schema

In **Terminal 1 (backend)**:
```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with Pakistani data
npm run prisma:seed
```

### Step 5: Configure Frontend Environment

1. **Create `.env` file in `frontend/` folder:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_AI_AGENT_URL=http://localhost:5001
   VITE_WS_URL=ws://localhost:5000
   ```

### Step 6: Configure AI Agent Environment

1. **Create `.env` file in `ai-agent/` folder:**
   ```env
   NODE_ENV=development
   PORT=5001
   AI_AGENT_URL=http://localhost:5001
   
   BACKEND_API_URL=http://localhost:5000/api
   
   OPENAI_API_KEY=your-openai-api-key-here
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

   **Note:** You need an OpenAI API key. Get one from [OpenAI Platform](https://platform.openai.com/api-keys)

### Step 7: Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Should see: `Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Should see: `Local: http://localhost:5173`

**Terminal 3 - AI Agent:**
```bash
cd ai-agent
npm run dev
```
Should see: `AI Agent server running on port 5001`

### Step 8: Access the Application

Open your browser and go to: **http://localhost:5173**

## Test Accounts

After seeding, you can use these test accounts:

### Tourist Account:
- Email: `tourist1@example.com`
- Password: `password123`

### Agency Account:
- Email: `ahmed@adventurepakistan.com`
- Password: `password123`

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running
- Check your DATABASE_URL in backend/.env
- Verify database `raahi_db` exists

### Port Already in Use
- Change PORT in .env files if 5000, 5001, or 5173 are taken

### OpenAI API Error
- Make sure you have a valid API key
- Check your OpenAI account has credits

### Prisma Errors
- Run `npx prisma generate` again
- Check DATABASE_URL is correct

## Quick Commands Reference

```bash
# Backend
cd backend
npm run dev              # Start backend
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database

# Frontend
cd frontend
npm run dev              # Start frontend

# AI Agent
cd ai-agent
npm run dev              # Start AI agent
```
