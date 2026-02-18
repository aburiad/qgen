# 🎓 Question Paper Generator - Complete Setup & Deployment Guide

## 📚 Table of Contents

1. [Overview](#overview)
2. [What We're Building](#what-were-building)
3. [Local Development Setup](#local-development-setup)
4. [Testing Locally](#testing-locally)
5. [Deploying to Render](#deploying-to-render)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

---

## Overview

Your Question Paper Generator app now has:

✅ **Frontend** (React + Vite)
- Create and manage question papers
- Real-time preview
- Print functionality
- ✨ **NEW**: PDF download with Puppeteer

✅ **Backend** (Node.js + Express)
- ✨ **NEW**: PDF generation server using Puppeteer
- CORS enabled for secure frontend communication
- Health check endpoints

---

## What We're Building

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Web Browser                         │
└───────────────────────────────────────────────────────────────┘
                            ↓↑
                        ┌───────┐
                        │ HTTPS │
                        └───────┘
                            ↓↑
        ┌───────────────────────────────────────────┐
        │          Render (Internet)                │
        ├───────────────────────────────────────────┤
        │  Frontend Service                         │
        │  (React App + Vite)                      │
        │  https://qgen-frontend.onrender.com      │
        └───────────────────────────────────────────┘
                            ↓↑
                        ┌───────┐
                        │ HTTPS │
                        └───────┘
                            ↓↑
        ┌───────────────────────────────────────────┐
        │  PDF Server Service                       │
        │  (Node.js + Express + Puppeteer)         │
        │  https://qgen-pdf-server.onrender.com    │
        └───────────────────────────────────────────┘
```

---

## Local Development Setup

### Step 1: Prerequisites

Install on your computer:
- **Node.js** (v16 or higher) - Download from https://nodejs.org/
- **Git** - Download from https://git-scm.com/
- **GitHub Account** - Sign up at https://github.com/

### Step 2: Clone and Install Dependencies

```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/xmpaper-generator-app.git
cd xmpaper-generator-app/v8-doublecopy

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Step 3: Create Environment Files

**Frontend** - Create `.env.local` in root:

```env
VITE_PDF_API_URL=http://localhost:5001
```

**PDF Server** - Create `server/.env`:

```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PUPPETEER_HEADLESS=true
```

### Step 4: Start Development Servers

**Terminal 1** - Start Frontend:

```bash
npm run dev
```

You'll see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

**Terminal 2** - Start PDF Server:

```bash
cd server
npm start
```

You'll see:
```
PDF Generator Server running on http://localhost:5001
CORS enabled for: http://localhost:5173
Environment: development
```

✅ Both servers are now running!

---

## Testing Locally

### Test 1: Frontend Access

1. Open browser: http://localhost:5173
2. You should see your question paper builder app
3. Try creating a question paper

### Test 2: PDF Server Health

```bash
# In a new terminal
curl http://localhost:5001/api/pdf/health
```

Expected response:
```json
{
  "success": true,
  "message": "PDF Server is running",
  "timestamp": "2024-02-18T10:30:00.000Z"
}
```

### Test 3: PDF Generation

1. In frontend, create a question paper
2. You should see TWO buttons:
   - **প্রিন্ট / সেভ করুন** (Print button)
   - **PDF ডাউনলোড করুন** (PDF Download button)
3. Click the PDF download button
4. A PDF should download to your computer
5. Open it to verify it looks correct

✅ If PDF downloads successfully, local testing is complete!

---

## Deploying to Render

### Step 1: Push Code to GitHub

```bash
# From root directory of project
git add .
git commit -m "Add PDF generation server with Puppeteer"
git push origin main
```

Make sure these files are committed:
- `server/` folder (entire)
- `.env.production`
- `RENDER_DEPLOYMENT_GUIDE.md`
- `render.yaml`

### Step 2: Deploy Frontend to Render

1. Go to https://render.com and **Sign Up**
2. Click **Dashboard** → **New +** → **Web Service**
3. Click **Connect GitHub repository**:
   - Select your repository
   - Click **Connect**

4. Configure the service:
   - **Name**: `qgen-frontend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm install -g serve && serve -s dist`
   - **Plan**: Free (or Starter for production)

5. Click **Environment** tab, add variable:
   - **Key**: `VITE_PDF_API_URL`
   - **Value**: `https://qgen-pdf-server.onrender.com`

6. Click **Create Web Service** and wait for deployment
   - Build takes 2-5 minutes
   - You'll get a URL like: `https://qgen-frontend.onrender.com`

✅ Frontend is deployed!

### Step 3: Deploy PDF Server to Render

1. In Render dashboard, click **New +** → **Web Service**
2. Select the same GitHub repository
3. Configure the service:
   - **Name**: `qgen-pdf-server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server` ⚠️ **IMPORTANT**
   - **Plan**: Free

4. Click **Environment** tab, add variables:
   ```
   NODE_ENV = production
   PORT = 5001
   FRONTEND_URL = https://qgen-frontend.onrender.com
   ```

5. Click **Create Web Service** and wait for deployment
   - You'll get a URL like: `https://qgen-pdf-server.onrender.com`

✅ PDF Server is deployed!

### Step 4: Update Frontend Configuration

1. Open `.env.production` locally
2. Update with your actual PDF server URL:

```env
VITE_PDF_API_URL=https://qgen-pdf-server.onrender.com
```

3. Commit and push:

```bash
git add .env.production
git commit -m "Update PDF server URL for production"
git push origin main
```

4. In Render dashboard:
   - Go to `qgen-frontend` service
   - Click **Manual Deploy** → **Deploy Latest Commit**
   - Wait for redeployment

✅ Frontend configuration updated!

### Step 5: Verify Deployment

1. **Test Frontend**:
   - Open: https://qgen-frontend.onrender.com
   - Create a question paper
   - Check both buttons are visible

2. **Test PDF Server**:
   - Open: https://qgen-pdf-server.onrender.com
   - You should see the API information

3. **Test PDF Generation**:
   - In your frontend
   - Click **PDF ডাউনলোড করুন** button
   - PDF should download

✅ Everything is working on the internet!

---

## Troubleshooting

### Common Issues & Solutions

#### 1. PDF Button Not Showing

**Problem**: You only see the print button, not the PDF button.

**Solutions**:
- Reload the page (Ctrl+F5 to clear cache)
- Wait for frontend to redeploy
- Check browser console for JavaScript errors

#### 2. PDF Download Fails (500 Error)

**Problem**: Clicking PDF button shows error message.

**Check PDF Server Logs**:
1. Go to Render dashboard
2. Click `qgen-pdf-server`
3. Click **Logs** tab
4. Look for error messages

**Common causes**:
- Puppeteer not installed → Redeploy server
- CORS error → Check FRONTEND_URL in environment
- Server crashed → Check logs for errors

**Solution**:
1. Fix the error
2. Commit changes
3. Push to GitHub
4. Render auto-redeploys

#### 3. CORS Error in Browser

**Error in console**: `"Access to XMLHttpRequest blocked by CORS policy"`

**Solution**:
1. Check `FRONTEND_URL` in PDF server environment variables
2. It must match your frontend URL exactly
3. Redeploy PDF server after changes

#### 4. High Latency / Slow PDF Generation

**Problem**: PDF takes 30+ seconds to generate.

**Causes**:
- Free tier Render service is waking up
- Large HTML content
- Browser timeout

**Solutions**:
- First request on free tier takes longer
- Reduce question paper size
- Upgrade to Starter plan ($7/month)

#### 5. Service in "Failed Build" State

**Problem**: Render shows red "Failed Build" status.

**Solution**:
1. Click the service
2. Click **Logs** → **Build Logs**
3. Read the error message
4. Fix the error in your code
5. Push to GitHub
6. Render auto-retries

---

## Environment Variables Summary

### Frontend (.env.local for local, .env.production for production)

```env
# This tells the frontend where to find the PDF server
VITE_PDF_API_URL=http://localhost:5001          # Local
VITE_PDF_API_URL=https://qgen-pdf-server.onrender.com # Production
```

### PDF Server (server/.env)

```env
# Server settings
PORT=5001                                           # Port to run on
NODE_ENV=development                                # environment
FRONTEND_URL=http://localhost:5173                  # Local
FRONTEND_URL=https://qgen-frontend.onrender.com     # Production

# Puppeteer settings (advanced)
PUPPETEER_HEADLESS=true                            # Run in headless mode
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome          # Optional: custom Chrome path
PUPPETEER_ARGS=--no-sandbox                        # Optional: Linux only
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Question Paper Generator App (React + Vite)      │ │
│  │                                                    │ │
│  │  [Print Button]  [PDF Download Button] ← NEW!     │ │
│  │                                                    │ │
│  │  Question Editor                                  │ │
│  │  Live Preview                                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                    ↓↑ HTTP/HTTPS
        ┌───────────────────────────────┐
        │  PDF Generation Server        │
        │  Node.js + Express            │ ← NEW!
        │                               │
        │  ┌─────────────────────────┐  │
        │  │ Puppeteer               │  │
        │  │ - Launch Browser        │  │
        │  │ - Render HTML to PDF    │  │
        │  │ - Send to Frontend      │  │
        │  └─────────────────────────┘  │
        └───────────────────────────────┘
                    ↓↑ API calls
        ┌───────────────────────────────┐
        │  Supabase (Database)          │
        │ - Store papers                │
        │ - User authentication         │
        └───────────────────────────────┘
```

---

## Next Steps

### After Deployment

1. ✅ **Test everything works**
2. 📱 **Share your live URL** with friends/colleagues
3. 💾 **Keep your code updated** on GitHub
4. 📊 **Monitor the deployment**:
   - Check Render dashboard regularly
   - Look at logs for errors
   - Test new features

### Production Improvements

**If you plan to use this in production:**

1. **Upgrade from Free to Starter Plan**:
   - Prevents services from spinning down
   - Better performance
   - ~$7-14/month per service

2. **Add Error Tracking**:
   - Sentry (error monitoring)
   - LogRocket (session replay)

3. **Monitor Usage**:
   - Google Analytics
   - Render metrics dashboard

4. **Optimize Performance**:
   - Compress images
   - Lazy load components
   - Cache static files

---

## File Structure Reference

```
your-repo/
├── src/                          # React Frontend
│   ├── app/
│   │   ├── components/
│   │   │   ├── GeneratePdfButton.tsx  ← NEW!
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── A4Preview.tsx (Updated)
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── pdfService.ts     ← NEW!
│   │   │   └── ...
│   │   └── ...
│   └── ...
│
├── server/                       # Node.js Backend ← NEW!
│   ├── index.js                  ← Main server file
│   ├── package.json
│   ├── .env                      ← Environment config
│   ├── controllers/
│   │   └── pdfController.js      ← PDF generation logic
│   ├── routes/
│   │   └── pdfRoutes.js          ← API routes
│   └── utils/
│       └── puppeteerConfig.js    ← Puppeteer setup
│
├── .env.local                    ← Frontend local env
├── .env.production               ← Frontend production env
├── .gitignore
├── package.json                  ← Frontend config
├── vite.config.ts
│
├── RENDER_DEPLOYMENT_GUIDE.md    ← Detailed Render guide ← READ THIS
├── LOCAL_PDF_SETUP.md            ← Local development guide
├── render.yaml                   ← Auto-deployment config
│
└── README.md
```

---

## Support Resources

### Documentation
- **Render Docs**: https://docs.render.com/
- **Puppeteer Docs**: https://pptr.dev/
- **Express Docs**: https://expressjs.com/
- **Vite Docs**: https://vitejs.dev/

### Guides in This Project
- [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) - Detailed Render setup
- [LOCAL_PDF_SETUP.md](./LOCAL_PDF_SETUP.md) - Local development
- [PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md) - Question paper pagination
- [render.yaml](./render.yaml) - Auto-deployment config

### Getting Help
1. Check the guides above
2. Search GitHub issues: https://github.com/puppeteer/puppeteer/issues
3. Ask in Render forums: https://feedback.render.com/
4. Check Render status: https://status.render.com/

---

## 🎉 Success!

Your Question Paper Generator app is now:

✅ Running locally with PDF generation
✅ Deployed to Render (available on the internet)
✅ Ready for teachers and students to use
✅ Automatically updated when you push to GitHub

**Share your app**: https://qgen-frontend.onrender.com

---

## Quick Command Reference

```bash
# Local Development
npm install                  # Install frontend dependencies
cd server && npm install    # Install server dependencies
npm run dev                 # Start frontend (Terminal 1)
cd server && npm start      # Start PDF server (Terminal 2)

# Testing
curl http://localhost:5001/api/pdf/health  # Check server health

# Deployment
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push origin main        # Push to GitHub

# Building
npm run build               # Build frontend for production
cd server && npm install    # Install server deps for production
```

---

**Last Updated**: February 18, 2026
**Version**: 1.0.0
**Status**: Ready for Production ✅
