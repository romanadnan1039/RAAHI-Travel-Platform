# 🚀 HOW TO USE RAAHI - Simple Guide

## ✅ EVERYTHING IS NOW RUNNING!

All services have been started and configured. Here's what you need to know:

## 🌐 Access Your Website

**Open your web browser and go to:**
```
http://localhost:5173
```

This is your main website URL!

## 📋 What's Running

1. **Frontend** (Your Website) - Port 5173 ✅
   - This is what you see in your browser
   - URL: http://localhost:5173

2. **Backend** (API Server) - Port 5000 ✅
   - Handles all data and requests
   - URL: http://localhost:5000

3. **AI Agent** (AI Chat) - Port 5001 ✅
   - Powers the AI travel assistant
   - URL: http://localhost:5001

## 🎯 Quick Start

1. **Open your browser**
2. **Go to:** http://localhost:5173
3. **You should see the login page!**

## ⚠️ Important Notes

### Database Setup (Optional for now)

The backend needs PostgreSQL database for full functionality. Right now:
- ✅ **Frontend works** - You can see the website
- ⚠️ **Backend features** - Will show errors until database is set up
- ✅ **UI/Design** - Everything visible and working

### To Set Up Database (Later):

1. **Install PostgreSQL** (if not installed)
   - Download: https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember your password!

2. **Create Database:**
   ```sql
   CREATE DATABASE raahi_db;
   ```

3. **Update `backend/.env`:**
   - Change `DATABASE_URL` to match your PostgreSQL password
   - Example: `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/raahi_db`

4. **Run Database Setup:**
   ```powershell
   cd backend
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

## 🛑 How to Stop Services

If you need to stop everything:

1. **Close the PowerShell windows** that opened (Backend, Frontend, AI Agent)
2. Or run this command:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
   ```

## 🔄 How to Restart Services

Just run this command again:
```powershell
.\START-EVERYTHING.ps1
```

Or double-click the `START-EVERYTHING.ps1` file!

## 🐛 Troubleshooting

### Website Not Loading?

1. **Wait 10-15 seconds** after starting - services need time to boot
2. **Check the PowerShell windows** - look for error messages
3. **Try:** http://127.0.0.1:5173 instead of localhost:5173
4. **Make sure ports are free:**
   ```powershell
   netstat -ano | findstr ":5173"
   ```

### Backend Errors?

- Database connection errors are **normal** if PostgreSQL isn't set up
- Frontend will still work for viewing the UI
- To fix: Set up PostgreSQL (see above)

### Port Already in Use?

Run this to kill processes:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

## 📞 Need Help?

Check the PowerShell windows for error messages. They will tell you what's wrong!

---

**🎉 Enjoy your RAAHI Travel Marketplace!**
