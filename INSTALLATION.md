# Installation Manual

This guide explains how to set up and run the Web Calculator project on a local machine, including client and server .

## Prerequisites

- Node.js 18+ (recommended LTS)
- npm 9+
- Git (optional)

Verify versions:
- node -v
- npm -v

## Repository Structure

- client/ (React app)
- server/ (Express/MongoDB API)

## 1) Server Setup

1. Create an .env file in server/ (reference keys below):

   Required (example values; adjust as needed):
   - PORT=4000
   - NODE_ENV=development
   - MONGO_URI=mongodb://127.0.0.1:27017/web_calculator
   - SESSION_SECRET=supersecret
   - ORIGIN=http://localhost:5173
   - SMTP_HOST=your.smtp.host
   - SMTP_PORT=587
   - SMTP_USER=your_username
   - SMTP_PASS=your_password

2. Install dependencies:

   - From the server folder: npm install

3. Start the API server:

   - npm run dev (with nodemon) or
   - npm start

4. API base URL:

   - http://localhost:4000 (by default)

## 2) Client Setup

1. Configure environment file (client/.env):

   - VITE_API_URL=http://localhost:4000

2. Install dependencies:

   - From the client folder: npm install

3. Start the client:

   - npm run dev

4. Open the app:

   - http://localhost:5173


## 4) Common Troubleshooting

- Port conflicts:
  - If 5173 (client) or 4000 (server) is occupied, change the port or stop the conflicting process.
- CORS errors:
  - Ensure ORIGIN in server .env matches the client URL (e.g., http://localhost:5173).
- Environment variables not loading:
  - Confirm .env files exist and variables are spelled correctly. Restart dev servers after changes.


## 5) Recommended Scripts

- server:
  - npm run dev (nodemon hot-reload) or npm start (production)
- client:
  - npm run dev (Vite dev server)




## 6) Folder Permissions & OS Notes

- Windows users may need to run the terminal as Administrator when installing dependencies.
- If antivirus interferes with npm installs, whitelist the project directory.

