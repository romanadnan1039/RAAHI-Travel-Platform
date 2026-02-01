# 🚀 START HERE - Run RAAHI

## ⚡ QUICKEST WAY:

**Just run this one command:**
```powershell
.\setup-and-run.ps1
```

---

## 📋 BEFORE YOU START:

### 1. Install Node.js
- Go to: https://nodejs.org/
- Download and install the LTS version
- **IMPORTANT:** Restart your terminal/IDE after installing

### 2. Install PostgreSQL
- Go to: https://www.postgresql.org/download/
- Download and install
- Remember your PostgreSQL password!

### 3. Create Database
Open PostgreSQL (pgAdmin or psql) and create database:
```sql
CREATE DATABASE raahi_db;
```

---

## 🎯 THEN RUN:

```powershell
.\setup-and-run.ps1
```

This script will:
- ✅ Install all dependencies
- ✅ Set up database
- ✅ Start all services
- ✅ Open browser automatically

---

## 🌐 ACCESS:

After running, open: **http://localhost:5173**

**Test Accounts:**
- Tourist: `tourist1@example.com` / `password123`
- Agency: `ahmed@adventurepakistan.com` / `password123`

---

## ❓ NEED HELP?

- See `RUN.md` for detailed instructions
- See `SETUP.md` for troubleshooting
- Run `.\check-setup.ps1` to verify setup

---

## ✅ WHAT TO EXPECT:

You'll see 3 terminal windows open:
1. **Backend** - Port 5000
2. **Frontend** - Port 5173  
3. **AI Agent** - Port 5001

Then open your browser to see the login page!
