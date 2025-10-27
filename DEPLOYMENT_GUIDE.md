# 🚀 Deployment Guide - Web Calculator

Complete guide for deploying the Web Calculator application with session-based authentication to production.

---

## 📋 Table of Contents
1. [Environment Variables](#environment-variables)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Options](#deployment-options)
4. [Session-Based Auth Configuration](#session-based-auth-configuration)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Troubleshooting](#troubleshooting)

---

## 🔐 Environment Variables

### **Server Environment Variables** (Backend)

Create a `.env` file in the `/server` directory with the following variables:

```env
# ============================================
# CRITICAL - MUST CHANGE FOR PRODUCTION
# ============================================
NODE_ENV=production
SESSION_SECRET=<GENERATE_STRONG_SECRET>
MONGO_URI=<YOUR_MONGODB_ATLAS_URI>
CLIENT_URL=<YOUR_FRONTEND_URL>

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=4000

# ============================================
# EMAIL CONFIGURATION
# ============================================
SMTP_USER=<YOUR_GMAIL_ADDRESS>
SMTP_PASS=<YOUR_GMAIL_APP_PASSWORD>
FROM_EMAIL=<YOUR_GMAIL_ADDRESS>

# ============================================
# OPTIONAL - ADVANCED CONFIGURATION
# ============================================
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
COOKIE_SECURE=true
TRUST_PROXY=true
COOKIE_DOMAIN=.yourdomain.com
```

#### 🔑 How to Generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 📧 How to Get Gmail App Password:
1. Enable 2-Factor Authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Copy the 16-character password (no spaces)

#### 🗄️ MongoDB Atlas Setup:
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Create database user with username and password
4. Whitelist IP addresses (or allow from anywhere: `0.0.0.0/0`)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/web_calculator`

---

### **Client Environment Variables** (Frontend)

Create a `.env` file in the `/client` directory:

```env
VITE_API_URL=<YOUR_BACKEND_URL>/api
```

**Examples:**
- Development: `VITE_API_URL=http://localhost:4000/api`
- Production: `VITE_API_URL=https://your-backend.com/api`

---

## ✅ Pre-Deployment Checklist

### Backend Checklist
- [ ] MongoDB Atlas database created and user configured
- [ ] Strong `SESSION_SECRET` generated (64+ characters)
- [ ] Gmail app-specific password obtained
- [ ] All environment variables configured
- [ ] `.env` file is in `.gitignore` (NEVER commit `.env` to Git!)
- [ ] Test backend locally: `cd server && npm run dev`

### Frontend Checklist
- [ ] `VITE_API_URL` points to production backend
- [ ] Test frontend locally: `cd client && npm run dev`
- [ ] Build works: `cd client && npm run build`
- [ ] Test production build: `cd client && npm run preview`

### Security Checklist
- [ ] `NODE_ENV=production` in production
- [ ] `SESSION_SECRET` is unique and strong
- [ ] `COOKIE_SECURE=true` for HTTPS
- [ ] CORS configured with actual frontend URL
- [ ] Rate limiting enabled
- [ ] Trust proxy enabled if behind reverse proxy

---

## 🌐 Deployment Options

### **Option 1: Deploy to Vercel (Frontend) + Render (Backend)**

#### Deploy Backend to Render:
1. Push code to GitHub
2. Go to https://render.com and create account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: web-calculator-api
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)
6. Add all environment variables from the list above
7. Deploy!
8. Copy your backend URL: `https://your-app.onrender.com`

#### Deploy Frontend to Vercel:
1. Go to https://vercel.com and create account
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
6. Deploy!
7. Update backend `.env` with Vercel URL:
   - `CLIENT_URL=https://your-app.vercel.app`

---

### **Option 2: Deploy to Railway (Full Stack)**

1. Go to https://railway.app
2. Create new project
3. Add MongoDB database (Railway provides this)
4. Deploy backend:
   - Add service from GitHub
   - Root directory: `server`
   - Start command: `npm start`
   - Add all environment variables
5. Deploy frontend:
   - Add service from GitHub
   - Root directory: `client`
   - Build command: `npm run build`
   - Start command: `npm run preview`
   - Add `VITE_API_URL` variable
6. Configure custom domains if needed

---

### **Option 3: Deploy to Heroku**

#### Backend Deployment:
```bash
cd server
heroku login
heroku create your-calculator-api
heroku addons:create mongolab:sandbox
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=<your-secret>
heroku config:set SMTP_USER=<your-email>
heroku config:set SMTP_PASS=<your-password>
heroku config:set FROM_EMAIL=<your-email>
heroku config:set CLIENT_URL=<your-frontend-url>
heroku config:set TRUST_PROXY=true
git push heroku main
```

#### Frontend Deployment:
Use Vercel or Netlify as described above.

---

### **Option 4: VPS Deployment (DigitalOcean, AWS, etc.)**

#### Server Setup:
```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/yourusername/web_calculator.git
cd web_calculator

# Setup backend
cd server
npm install
# Create .env file with all variables
nano .env

# Start with PM2
pm2 start server.js --name web-calculator-api
pm2 save
pm2 startup

# Setup frontend
cd ../client
npm install
npm run build

# Install and configure Nginx
sudo apt-get install nginx

# Configure Nginx (see below)
sudo nano /etc/nginx/sites-available/web-calculator

# Enable site
sudo ln -s /etc/nginx/sites-available/web-calculator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Nginx Configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/web_calculator/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Setup SSL with Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔒 Session-Based Auth Configuration

### Key Considerations for Production:

#### 1. **Secure Cookies**
```javascript
cookie: {
  httpOnly: true,        // Prevent XSS attacks
  secure: true,          // HTTPS only
  sameSite: 'none',      // Cross-origin requests
  maxAge: 30 * 60 * 1000 // 30 minutes
}
```

#### 2. **Trust Proxy**
When behind a reverse proxy (Nginx, Heroku, Render):
```javascript
app.set('trust proxy', 1);
```
Set `TRUST_PROXY=true` in environment variables.

#### 3. **CORS Configuration**
Must allow credentials and specify exact origins:
```javascript
cors({
  origin: 'https://your-frontend.com',
  credentials: true
})
```

#### 4. **SameSite Cookie Attribute**
- **Development** (same domain): `sameSite: 'lax'`
- **Production** (cross-origin): `sameSite: 'none'` + `secure: true`

#### 5. **Session Store**
Uses MongoDB for session persistence:
```javascript
store: MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: 'sessions',
  touchAfter: 24 * 3600
})
```

---

## 📝 Post-Deployment Steps

### 1. **Verify Backend Health**
```bash
curl https://your-backend.com/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-10-27T...",
  "environment": "production"
}
```

### 2. **Test API Endpoints**
```bash
# Check CORS
curl -H "Origin: https://your-frontend.com" \
     --verbose \
     https://your-backend.com/health

# Test login
curl -X POST https://your-backend.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
```

### 3. **Monitor Logs**
- **Render**: Dashboard → Logs
- **Vercel**: Deployment → Runtime Logs
- **Heroku**: `heroku logs --tail`
- **PM2**: `pm2 logs web-calculator-api`

### 4. **Create Admin User**
Connect to MongoDB and run:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

### 5. **Test User Flows**
- [ ] User registration with OTP
- [ ] User login
- [ ] Session persistence
- [ ] Password reset flow
- [ ] Admin dashboard access
- [ ] Calculator functionality
- [ ] History saving

---

## 🐛 Troubleshooting

### **Issue: CORS Errors**
**Symptoms**: Browser shows CORS policy errors, login fails

**Solutions**:
1. Verify `CLIENT_URL` in backend `.env` matches frontend URL exactly
2. Check `credentials: true` in CORS config
3. Ensure `withCredentials: true` in axios requests
4. For cross-origin: Set `sameSite: 'none'` and `secure: true`

**Check frontend axios config:**
```javascript
axios.defaults.withCredentials = true;
```

---

### **Issue: Session Not Persisting**
**Symptoms**: User logged out immediately, session doesn't work

**Solutions**:
1. Set `TRUST_PROXY=true` if behind reverse proxy
2. Verify `secure: true` only when using HTTPS
3. Check MongoDB connection for session store
4. Verify `sameSite` attribute matches your deployment:
   - Same domain: `'lax'`
   - Cross-origin: `'none'` (requires `secure: true`)

**Debug session:**
```javascript
// In server.js, add middleware:
app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('SessionID:', req.sessionID);
  next();
});
```

---

### **Issue: Environment Variables Not Loading**
**Symptoms**: Undefined values, app crashes on start

**Solutions**:
1. Verify `.env` file exists in correct directory
2. Check file is not named `.env.example`
3. Restart server after changing `.env`
4. For Vercel/Render: Add variables in dashboard
5. Check variable names match exactly (case-sensitive)

**Test env variables:**
```javascript
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing');
```

---

### **Issue: MongoDB Connection Failed**
**Symptoms**: "MongoServerError", connection timeout

**Solutions**:
1. Verify MongoDB URI format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database
   ```
2. Check username/password don't contain special characters (encode if needed)
3. Whitelist server IP in MongoDB Atlas Network Access
4. For "0.0.0.0/0": Allow access from anywhere (not recommended for production)
5. Test connection:
   ```bash
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
   ```

---

### **Issue: Email Not Sending**
**Symptoms**: OTP or password reset emails not arriving

**Solutions**:
1. Verify Gmail app-specific password (not regular password)
2. Check SMTP_USER and FROM_EMAIL are same Gmail address
3. Test email manually:
   ```javascript
   // Create test route in server
   app.get('/test-email', async (req, res) => {
     try {
       await sendMail({
         to: 'test@example.com',
         subject: 'Test Email',
         text: 'If you receive this, email is working!'
       });
       res.json({ success: true });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```
4. Check Gmail "Less secure app access" settings
5. Verify 2FA is enabled and app password is generated

---

### **Issue: Rate Limiting Too Aggressive**
**Symptoms**: "Too many requests" error frequently

**Solutions**:
1. Increase rate limit in `.env`:
   ```env
   RATE_LIMIT_MAX_REQUESTS=200
   RATE_LIMIT_WINDOW_MS=900000
   ```
2. Skip rate limiting for specific routes
3. Use different limits for different endpoints

---

### **Issue: Build Fails**
**Symptoms**: `npm run build` errors

**Solutions**:
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check Node.js version (recommended: v18 or v20)
3. Review build errors for missing dependencies
4. Verify all imports are correct

---

## 📊 Monitoring & Maintenance

### **Recommended Monitoring Tools**
1. **Uptime Monitoring**: UptimeRobot, Pingdom
2. **Error Tracking**: Sentry, LogRocket
3. **Performance**: New Relic, Datadog
4. **Logs**: Papertrail, Loggly

### **Regular Maintenance**
- [ ] Monitor MongoDB database size
- [ ] Clean old sessions periodically
- [ ] Review audit logs for suspicious activity
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Monitor rate limit effectiveness
- [ ] Check email delivery rates

### **Database Cleanup**
```javascript
// Remove expired sessions (optional, MongoStore does this automatically)
db.sessions.deleteMany({ expires: { $lt: new Date() } })

// Archive old audit logs
db.auditlogs.deleteMany({ 
  timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } 
})
```

---

## 🔗 Useful Commands

### **Development**
```bash
# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev

# Build frontend
cd client && npm run build

# Preview production build
cd client && npm run preview
```

### **Production**
```bash
# Backend (with PM2)
pm2 start server.js --name web-calculator-api
pm2 restart web-calculator-api
pm2 stop web-calculator-api
pm2 logs web-calculator-api
pm2 monit

# Check environment
pm2 env 0

# Save PM2 configuration
pm2 save
```

---

## 📚 Additional Resources

- [Express Session Documentation](https://www.npmjs.com/package/express-session)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [CORS Configuration](https://expressjs.com/en/resources/middleware/cors.html)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt SSL](https://letsencrypt.org/getting-started/)

---

## 🆘 Need Help?

If you encounter issues not covered here:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test each component independently (database, backend, frontend)
4. Review browser console for frontend errors
5. Check Network tab for failed requests

---

## ✅ Deployment Checklist Summary

### Before Deployment
- [ ] All environment variables configured
- [ ] `.env` files in `.gitignore`
- [ ] MongoDB Atlas database created
- [ ] Gmail app password generated
- [ ] Session secret generated
- [ ] Code tested locally

### During Deployment
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Environment variables added to hosting platform
- [ ] CORS configured with production URLs
- [ ] SSL certificate installed (HTTPS)

### After Deployment
- [ ] Health endpoint responding
- [ ] Login/signup working
- [ ] Sessions persisting
- [ ] Emails sending
- [ ] Calculator functioning
- [ ] Admin dashboard accessible
- [ ] Monitoring setup

---

**Last Updated**: October 27, 2025
**Version**: 1.0.0
