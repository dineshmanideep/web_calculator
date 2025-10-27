# 📝 Environment Variables - Quick Copy

Since you mentioned you'll handle adding the environment variables yourself, here's a clean list of ALL the variables you need to add to your deployment platform.

---

## 🔴 BACKEND Environment Variables

### **Required (Must Have)**

```env
NODE_ENV=production

SESSION_SECRET=<PASTE_YOUR_GENERATED_SECRET_HERE>
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

MONGO_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
# Format: mongodb+srv://username:password@cluster.mongodb.net/web_calculator

CLIENT_URL=<YOUR_FRONTEND_URL>
# Example: https://your-app.vercel.app

SMTP_USER=<YOUR_GMAIL_ADDRESS>
# Example: youremail@gmail.com

SMTP_PASS=<YOUR_GMAIL_APP_PASSWORD>
# Get from: https://myaccount.google.com/apppasswords

FROM_EMAIL=<YOUR_GMAIL_ADDRESS>
# Same as SMTP_USER
```

### **Optional (Recommended for Production)**

```env
PORT=4000
# Default is 4000, change if needed

TRUST_PROXY=true
# Set to 'true' for Render, Heroku, Railway, Vercel, etc.

COOKIE_SECURE=true
# Set to 'true' when using HTTPS (production)

ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
# Comma-separated list if multiple domains

COOKIE_DOMAIN=.yourdomain.com
# Only if using custom domain

RATE_LIMIT_WINDOW_MS=900000
# 15 minutes in milliseconds

RATE_LIMIT_MAX_REQUESTS=100
# Max requests per window per IP
```

---

## 🔵 FRONTEND Environment Variables

### **Required**

```env
VITE_API_URL=<YOUR_BACKEND_URL>/api
# Examples:
# Development: http://localhost:4000/api
# Production: https://your-backend.onrender.com/api
```

---

## 🔑 How to Get These Values

### **SESSION_SECRET**
Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output (will be 128 characters long)

### **MONGO_URI**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user with username and password
4. Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)
5. Connect → Connect your application → Copy connection string
6. Replace `<password>` with your actual password
7. Add database name at the end: `/web_calculator`

Final format:
```
mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/web_calculator
```

### **SMTP_PASS (Gmail App Password)**
1. Enable 2-Factor Authentication on your Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and your device
4. Click "Generate"
5. Copy the 16-character password (no spaces)

---

## 🎯 Platform-Specific Instructions

### **Render**
1. Dashboard → Environment Variables
2. Add each variable as KEY = VALUE
3. Click "Save"

### **Vercel**
1. Project Settings → Environment Variables
2. Add each variable
3. Select "Production" environment
4. Click "Save"

### **Railway**
1. Project → Variables
2. Click "+ New Variable"
3. Add each variable

### **Heroku**
```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret-here
heroku config:set MONGO_URI=your-mongo-uri-here
# ... repeat for each variable
```

Or use Heroku Dashboard → Settings → Config Vars

---

## ⚡ Minimum Setup (For Testing)

If you just want to test deployment quickly, these are the ABSOLUTE MINIMUM variables needed:

### Backend:
```env
NODE_ENV=production
SESSION_SECRET=<generate-this>
MONGO_URI=<your-mongodb-uri>
CLIENT_URL=<your-frontend-url>
SMTP_USER=<your-gmail>
SMTP_PASS=<gmail-app-password>
FROM_EMAIL=<your-gmail>
TRUST_PROXY=true
```

### Frontend:
```env
VITE_API_URL=<your-backend-url>/api
```

---

## 🧪 Testing Your Variables

After setting environment variables, test them:

### Backend Health Check:
```bash
curl https://your-backend.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-10-27T...",
  "environment": "production"
}
```

### Frontend Test:
Open browser console on your frontend and run:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

Should show your backend URL.

---

## ✅ Checklist

Before deploying, make sure you have:

Backend:
- [ ] Generated SESSION_SECRET (128 characters)
- [ ] Created MongoDB Atlas cluster
- [ ] Got MongoDB connection string
- [ ] Generated Gmail app password
- [ ] All 7 required backend variables ready

Frontend:
- [ ] Got backend deployment URL
- [ ] Have VITE_API_URL ready

After deploying:
- [ ] Update CLIENT_URL in backend with actual frontend URL
- [ ] Redeploy backend

---

## 📋 Copy-Paste Template

Here's a template you can copy and fill in:

```env
# ============================================
# BACKEND ENVIRONMENT VARIABLES
# ============================================

NODE_ENV=production
SESSION_SECRET=
MONGO_URI=
CLIENT_URL=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=
TRUST_PROXY=true
COOKIE_SECURE=true
PORT=4000

# ============================================
# FRONTEND ENVIRONMENT VARIABLES
# ============================================

VITE_API_URL=
```

---

## 🆘 Quick Troubleshooting

**If login doesn't work:**
- Check `CLIENT_URL` in backend matches your frontend URL exactly
- Make sure `TRUST_PROXY=true` is set
- Verify `COOKIE_SECURE=true` and you're using HTTPS

**If emails don't send:**
- Use Gmail app-specific password, not regular password
- Make sure SMTP_USER and FROM_EMAIL are the same

**If backend won't start:**
- Check MongoDB URI is correct
- Verify all required variables are set
- Check logs for specific error messages

---

For complete deployment instructions, see: **DEPLOYMENT_GUIDE.md**
For quick reference, see: **DEPLOYMENT_CHECKLIST.md**
