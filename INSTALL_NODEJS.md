# 🔧 Install Node.js - Quick Guide

## Why You Need Node.js:
Node.js is required to run the RAAHI project. It's the runtime that executes JavaScript/TypeScript code.

## 📥 Installation Steps:

### Option 1: Official Website (Recommended)
1. Go to: **https://nodejs.org/**
2. Click **"Download Node.js (LTS)"** - the green button
3. Run the installer (.msi file)
4. Click "Next" through the installation wizard
5. **IMPORTANT:** Check "Automatically install necessary tools"
6. Finish installation
7. **RESTART your terminal/IDE/PowerShell**

### Option 2: Using Chocolatey (if you have it)
```powershell
choco install nodejs-lts
```

### Option 3: Using Winget (Windows 11)
```powershell
winget install OpenJS.NodeJS.LTS
```

## ✅ Verify Installation:

After installing and restarting terminal, run:
```powershell
node --version
npm --version
```

You should see version numbers like:
```
v20.10.0
10.2.3
```

## 🎯 After Installing Node.js:

1. **Restart your terminal/IDE**
2. Run: `.\setup-and-run.ps1`
3. That's it! The script will do everything else.

## ❓ Troubleshooting:

**"node is not recognized"**
- Make sure you restarted your terminal
- Check if Node.js is in PATH: `$env:PATH`
- Try reinstalling Node.js

**Installation failed**
- Run installer as Administrator
- Check Windows Defender isn't blocking it
- Try downloading the installer again

---

**Once Node.js is installed, you're ready to run RAAHI!** 🚀
