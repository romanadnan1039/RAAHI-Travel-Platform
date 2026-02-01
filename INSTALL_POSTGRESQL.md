# Install PostgreSQL - Quick Guide

PostgreSQL installation via winget failed. Here's how to install it manually:

## Option 1: Download from Website (Recommended)

1. Go to: **https://www.postgresql.org/download/windows/**
2. Click "Download the installer"
3. Run the installer
4. **Important:** Remember the password you set for the `postgres` user
5. Use default port: **5432**
6. Complete installation

## Option 2: Try Winget Again

```powershell
winget install PostgreSQL.PostgreSQL.15 --accept-package-agreements --accept-source-agreements
```

## After Installation:

1. **Create Database:**
   - Open **pgAdmin** (comes with PostgreSQL)
   - Right-click "Databases" → "Create" → "Database"
   - Name: `raahi_db`
   - Click "Save"

   **OR using command line:**
   ```powershell
   psql -U postgres
   CREATE DATABASE raahi_db;
   \q
   ```

2. **Update backend/.env:**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/raahi_db
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password

3. **Then run:**
   ```powershell
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

## Quick Test:

After installing, test connection:
```powershell
psql -U postgres -d raahi_db
```

If it connects, you're ready!
