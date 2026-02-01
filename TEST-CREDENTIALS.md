# RAAHI Test Credentials

## 🚨 IMPORTANT: After Database Reset

After running `npm run prisma:seed` in the backend, you **MUST** clear your browser's authentication data:

### Option 1: Use the Clear Data Tool
1. Open `CLEAR-BROWSER-DATA.html` in your browser
2. Click "Clear Browser Data"
3. You'll be redirected to login automatically

### Option 2: Manual Clear
1. Open Browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete `token` and `user` items
4. Refresh the page

---

## 👤 Tourist Test Accounts

Use these credentials to login as a tourist (can browse and book packages):

| Email | Password | Notes |
|-------|----------|-------|
| tourist1@example.com | tourist123 | Primary test account |
| tourist2@example.com | tourist123 | Secondary test account |
| tourist3@example.com | tourist123 | - |
| ... | tourist123 | Up to tourist30@example.com |

**Tourist Features:**
- ✅ Browse packages with filters
- ✅ Chat with AI assistant
- ✅ Book packages
- ✅ View booking history
- ✅ Cancel bookings

---

## 🏢 Agency Test Accounts

Use these credentials to login as an agency (can create and manage packages):

| Agency Name | Email | Password | Location |
|-------------|-------|----------|----------|
| Hunza Travels | hunza@travels.com | agency123 | Hunza |
| Swat Adventures | swat@adventures.com | agency123 | Swat |
| Naran Tours | naran@tours.com | agency123 | Naran |
| Kashmir Valley Tours | kashmir@tours.com | agency123 | Muzaffarabad |
| Skardu Expeditions | skardu@expeditions.com | agency123 | Skardu |
| Northern Pakistan Travels | northern@travels.com | agency123 | Islamabad |
| Adventure Pakistan | adventure@pakistan.com | agency123 | Lahore |
| Family Travel Co | family@travel.com | agency123 | Karachi |
| Luxury Travel Pakistan | luxury@travel.com | agency123 | Islamabad |
| Budget Travel Pakistan | budget@travel.com | agency123 | Lahore |

**Agency Features:**
- ✅ Create new packages
- ✅ View all packages
- ✅ Manage bookings (accept/reject)
- ✅ View notifications
- ✅ View booking history

---

## 🐛 Troubleshooting

### "Foreign key constraint violated" Error
**Cause:** Your browser has an old authentication token pointing to a user ID that doesn't exist in the database anymore.

**Solution:**
1. Open `CLEAR-BROWSER-DATA.html` and clear your data
2. OR manually delete localStorage items
3. Login again with credentials above

### "Invalid credentials" Error
**Check:**
- ✅ Using correct email format (tourist1@example.com, NOT user1@example.com)
- ✅ Using correct password (tourist123 for tourists, agency123 for agencies)
- ✅ Not mixing up tourist/agency login pages

### Backend Not Running
**Fix:**
```bash
# In backend directory
npm run dev
```

### Frontend Not Running
**Fix:**
```bash
# In frontend directory
npm run dev
```

### Database Not Set Up
**Fix:**
```bash
# In backend directory
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## 🚀 Quick Start Guide

1. **Start Services:**
   - Run `START-EVERYTHING.ps1` (Windows)
   - OR start each service manually

2. **Clear Browser Data:**
   - Open `CLEAR-BROWSER-DATA.html`
   - Click "Clear Browser Data"

3. **Login:**
   - Go to http://localhost:5173
   - Click "Login as Tourist" or "Login as Agency"
   - Use credentials from tables above

4. **Test Features:**
   - **Tourist:** Browse packages, use AI chat, book a package
   - **Agency:** Create a package, view bookings, manage requests

---

## 📊 Database Stats

After seeding, the database contains:
- **30 Tourist Users** (tourist1 through tourist30)
- **10 Agencies** (various travel companies)
- **84 Packages** (diverse destinations, prices 5K-150K PKR)
- **25 Sample Bookings** (for testing)
- **20 Sample Reviews** (for testing)

---

## 🔐 Security Notes

⚠️ **These are test credentials for development only!**
- Never use these passwords in production
- Never commit real credentials to git
- Change all passwords before deploying

---

## 💡 Tips

- **Use tourist1@example.com** for most testing (it's easy to remember)
- **Use hunza@travels.com** for agency testing
- **Clear browser data** after every database reset
- **Check console logs** (F12) for detailed error messages
- **Backend logs** show authentication and booking details
