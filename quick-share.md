# 🚀 Quick Share with ngrok (Temporary URL)

If you just want to share your app quickly for a demo or presentation without full deployment:

## Step 1: Download ngrok

1. Go to: https://ngrok.com/download
2. Click "Download for Windows"
3. Extract the zip file to a folder (e.g., `C:\ngrok`)
4. Sign up for a free account at: https://dashboard.ngrok.com/signup
5. Copy your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

## Step 2: Setup ngrok

Open PowerShell and run:

```powershell
cd C:\ngrok
.\ngrok authtoken YOUR-AUTH-TOKEN-HERE
```

## Step 3: Make Frontend Accessible

In a NEW PowerShell window:

```powershell
cd C:\ngrok
.\ngrok http 5173
```

You'll see output like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:5173
```

**COPY that URL!** (e.g., `https://abc123.ngrok.io`)

## Step 4: Share It!

Share the ngrok URL with anyone. They can access your app from anywhere!

**⚠️ Important:**
- This URL is **temporary** - it expires when you close ngrok
- Free plan has a limit of 40 connections/minute
- For FYP presentation, this is perfect!
- For permanent deployment, use Option 1 (Railway + Vercel)

## Quick Test:

1. Open the ngrok URL in your phone's browser
2. Login: `tourist1@example.com` / `password123`
3. Browse packages, use filters, chat with AI!

**Perfect for:**
- ✅ Showing your FYP to teachers
- ✅ Demo to friends/family
- ✅ Testing on mobile devices
- ❌ NOT for permanent deployment
