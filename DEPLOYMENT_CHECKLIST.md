# 🚀 Quick Deployment Checklist

## Environment Variables You Need to Add

### **Backend (.env in /server directory)**

```env
# CRITICAL - REQUIRED FOR PRODUCTION
NODE_ENV=production
SESSION_SECRET=<generate-with-crypto>
MONGO_URI=<your-mongodb-atlas-uri>
CLIENT_URL=<your-frontend-url>

# EMAIL CONFIGURATION
SMTP_USER=<your-gmail>
SMTP_PASS=<gmail-app-password>
FROM_EMAIL=<your-gmail>

# OPTIONAL - RECOMMENDED
ALLOWED_ORIGINS=<comma-separated-frontend-urls>
TRUST_PROXY=true
COOKIE_SECURE=true
```

### **Frontend (.env in /client directory)**

```env
VITE_API_URL=<your-backend-url>/api
```

---

## Generate SESSION_SECRET

Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Quick Setup Steps

### 1. Backend Deployment (e.g., Render/Heroku)
- [ ] Create MongoDB Atlas database
- [ ] Get Gmail app password
- [ ] Generate SESSION_SECRET
- [ ] Add all environment variables to hosting platform
- [ ] Deploy backend
- [ ] Copy backend URL

### 2. Frontend Deployment (e.g., Vercel/Netlify)
- [ ] Add `VITE_API_URL` with backend URL
- [ ] Deploy frontend
- [ ] Copy frontend URL

### 3. Update CORS
- [ ] Update backend `CLIENT_URL` with frontend URL
- [ ] Redeploy backend

### 4. Test
- [ ] Visit `https://your-backend.com/health`
- [ ] Test login/signup
- [ ] Test calculator functionality

---

## Important Notes for Session-Based Auth

✅ **Must have for production:**
- `NODE_ENV=production`
- `TRUST_PROXY=true` (if behind proxy/load balancer)
- `COOKIE_SECURE=true` (requires HTTPS)
- `sameSite: 'none'` for cross-origin (already configured in code)
- Exact `CLIENT_URL` in backend matching frontend

✅ **MongoDB Atlas:**
- Create cluster
- Create database user
- Whitelist IP addresses
- Get connection string

✅ **Gmail Setup:**
- Enable 2FA
- Generate app password at: https://myaccount.google.com/apppasswords
- Use app password (not regular password) in `SMTP_PASS`

---

## Testing Production Build Locally

### Backend:
```bash
cd server
# Create .env with production values
NODE_ENV=production npm start
```

### Frontend:
```bash
cd client
# Create .env with production API URL
npm run build
npm run preview
```

---

## Common Issues

**CORS Errors?**
→ Check `CLIENT_URL` matches frontend URL exactly

**Session Not Working?**
→ Set `TRUST_PROXY=true` and `COOKIE_SECURE=true`

**Email Not Sending?**
→ Use Gmail app password, not regular password

**MongoDB Connection Failed?**
→ Whitelist IP in MongoDB Atlas Network Access

---

For detailed guide, see: `DEPLOYMENT_GUIDE.md`
