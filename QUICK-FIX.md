# 🚨 QUICK FIX FOR BOOKING & LOGIN ISSUES

## The Problem
You're getting a "Foreign key constraint violated" error because your browser has an **old authentication token** that points to a user ID that no longer exists in the database (after re-seeding).

## The Solution (3 Simple Steps)

### Step 1: Open Browser DevTools
1. Press **F12** on your keyboard (or right-click → Inspect)
2. Go to the **Application** tab (or **Storage** tab in Firefox)
3. Click on **Local Storage** → **http://localhost:5173**
4. **Delete** both:
   - `token`
   - `user`
5. **Close DevTools**

### Step 2: Refresh Page
1. Press **F5** or **Ctrl+R** to refresh the page
2. You should be logged out now

### Step 3: Login Again
Use these credentials:

**For Tourist (to book packages):**
- Email: `tourist1@example.com`
- Password: `tourist123`

**For Agency (to create packages):**
- Email: `hunza@travels.com`
- Password: `agency123`

---

## Alternative: Use the Automatic Tool

1. Open `CLEAR-BROWSER-DATA.html` in your browser
2. Click "Clear Browser Data"
3. It will auto-redirect you to login

---

## Why Did This Happen?

When we ran `npm run prisma:seed`, it:
1. ❌ Deleted all old users from database
2. ✅ Created new users with new IDs

But your browser still had the old token with the old user ID!

**Result:** When trying to book, the backend said "User not found" → Foreign key error

---

## Now Everything Works! ✨

After clearing browser data and logging in again:
- ✅ **Login works** (you get a fresh token)
- ✅ **Booking works** (your user ID exists in database)
- ✅ **All images load** (we fixed the image URLs)
- ✅ **Filters work** (Upwork-style sidebar)
- ✅ **AI chatbot works** (with book now functionality)

---

## Test It!

1. **Login as Tourist:**
   - Email: tourist1@example.com
   - Password: tourist123

2. **Browse Packages:**
   - Use filters on the left
   - Click any package
   - Fill booking form
   - Click "Book Now"

3. **Should See:**
   - ✅ "Booking created successfully!"
   - ✅ Booking appears in "My Bookings" tab

---

## If Still Not Working

Check backend console for errors:
- Is PostgreSQL running?
- Is backend on port 5000?
- Any errors in backend terminal?

Check frontend console (F12 → Console):
- Any red errors?
- What's the exact error message?

---

**Need more help?** Check `TEST-CREDENTIALS.md` for all available test accounts!
