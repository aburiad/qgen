# 🎬 Step-by-Step Visual Guide: From Local to Live

**Duration**: 20 minutes  
**Goal**: Get your Question Paper Generator with PDF feature running locally, then deployed to the internet

---

## Phase 1: Local Setup (5 minutes) ⚡

### Step 1: Open Terminal/PowerShell

**Windows**: Press `Win + R`, type `powershell`, press Enter

**Mac/Linux**: Open Terminal

### Step 2: Navigate to Project

```bash
cd path/to/your/xmpaper-generator-app/v8-doublecopy
```

### Step 3: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

**You'll see**: Lots of packages being installed (takes 2-3 minutes)

### Step 4: Create Environment Files

**In root folder**, create `.env.local`:

```
VITE_PDF_API_URL=http://localhost:5001
```

**In `server` folder**, create `.env`:

```
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PUPPETEER_HEADLESS=true
```

### Step 5: Start Two Servers

**Terminal 1** - Open new terminal, run:
```bash
npm run dev
```

**You'll see**:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Terminal 2** - In other terminal:
```bash
cd server
npm start
```

**You'll see**:
```
PDF Generator Server running on http://localhost:5001
CORS enabled for: http://localhost:5173
Environment: development
```

✅ **Both servers running!**

---

## Phase 2: Test Locally (5 minutes) 🧪

### Step 1: Open Browser

Go to: **http://localhost:5173**

You should see your Question Paper Generator app

### Step 2: Create a Question Paper

1. Click "Dashboard" or "New Paper"
2. Add some questions
3. Go to Preview or A4 Preview page
4. You should see **2 buttons**:
   - **প্রিন্ট / সেভ করুন** (blue, print button)
   - **PDF ডাউনলোড করুন** (green, new!) ✨

### Step 3: Test PDF Download

1. Click the green **"PDF ডাউনলোড করুন"** button
2. Watch for:
   - Loading spinner appears
   - Button text says "PDF তৈরি হচ্ছে..."
   - After 2-3 seconds, PDF downloads
3. Check your Downloads folder
4. Open the PDF file
5. Verify it looks correct ✅

**If this works, local testing is complete!**

---

## Phase 3: Prepare for Deployment (3 minutes) 📦

### Step 1: Commit Code to Git

```bash
# In root folder of project
git add .
git commit -m "Add PDF generation server with Puppeteer"
git push origin main
```

**Verify**: GitHub should show your changes

### Step 2: Create `.env.production` File

In root folder, create `.env.production`:

```
VITE_PDF_API_URL=https://qgen-pdf-server.onrender.com
```

Note: We'll update this after creating the PDF server on Render

### Step 3: Git Commit Again

```bash
git add .env.production
git commit -m "Add production environment configuration"
git push origin main
```

---

## Phase 4: Deploy to Render (10 minutes) 🚀

### Part A: Deploy Frontend

#### Step 1: Go to Render

1. Open: https://render.com
2. Sign up with GitHub
3. Click **Dashboard**

#### Step 2: Create Frontend Service

1. Click **New +** → **Web Service**
2. Select your GitHub repository
3. Click **Connect**

#### Step 3: Configure Frontend

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `qgen-frontend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm install -g serve && serve -s dist` |
| **Plan** | Free |

#### Step 4: Add Environment Variable

1. Click on the (empty) **Environment** section
2. Click **Add Environment Variable**
3. Set:
   - **Key**: `VITE_PDF_API_URL`
   - **Value**: `https://qgen-pdf-server.onrender.com`

#### Step 5: Deploy

Click **Create Web Service**

**Watch the magic happen**:
- Build starts (you see logs)
- Dependencies install
- App builds
- Service becomes "Live" (green)
- You get a URL like: `https://qgen-frontend.onrender.com`

⏱️ **Takes about 3-5 minutes**

### Part B: Deploy PDF Server

#### Step 1: Create PDF Server Service

Back in Render Dashboard:

1. Click **New +** → **Web Service**
2. Select your GitHub repo
3. Click **Connect**

#### Step 2: Configure PDF Server

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `qgen-pdf-server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Root Directory** | `server` ⚠️ **IMPORTANT** |
| **Plan** | Free |

#### Step 3: Add Environment Variables

1. Click **Environment** section
2. Click **Add Environment Variable** (do this 3 times)

Add these three:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5001` |
| `FRONTEND_URL` | `https://qgen-frontend.onrender.com` |

(Note: Replace `qgen-frontend` with your actual frontend service name)

#### Step 4: Deploy

Click **Create Web Service**

⏱️ **Takes about 3-5 minutes**

You'll get a URL like: `https://qgen-pdf-server.onrender.com`

---

## Phase 5: Final Configuration (2 minutes) ⚙️

### Step 1: Update Production Config

1. Edit your project's `.env.production` file
2. Change the URL:

```env
VITE_PDF_API_URL=https://qgen-pdf-server.onrender.com
```

Make sure it matches your actual PDF server URL from Render

### Step 2: Push to GitHub

```bash
git add .env.production
git commit -m "Update PDF server URL with production endpoint"
git push origin main
```

### Step 3: Redeploy Frontend

Go back to Render Dashboard:

1. Click your **qgen-frontend** service
2. Scroll down to find **Deployments** section
3. Find the latest deployment
4. Click the **three dots** menu
5. Click **Redeploy**

Wait for it to redeploy (2-3 minutes)

---

## ✅ Final Verification

### Test 1: Frontend is Live

1. Open: `https://qgen-frontend.onrender.com`
2. You should see your Question Paper Generator app
3. Try creating a question paper

### Test 2: PDF Server is Running

1. Open: `https://qgen-pdf-server.onrender.com`
2. You should see JSON response:
```json
{
  "success": true,
  "message": "Question Paper PDF Generator Server",
  "version": "1.0.0",
  ...
}
```

### Test 3: PDF Download Works

1. Go to `https://qgen-frontend.onrender.com`
2. Create a question paper
3. Click the green **"PDF ডাউনলোড করুন"** button
4. PDF should download (may take 10-30 seconds on first try)
5. Open PDF and verify it looks correct

✅ **If all three work, you're done!**

---

## 🎉 Success! Your App is Live!

```
┌─────────────────────────────────────────────┐
│  🎊 CONGRATULATIONS! 🎊                     │
│                                             │
│  Your app is now live on the internet!      │
│                                             │
│  Frontend:  https://qgen-frontend.onrender.com
│  PDF Server: https://qgen-pdf-server.onrender.com
│                                             │
│  Share the frontend URL with your users!    │
└─────────────────────────────────────────────┘
```

---

## 📋 Troubleshooting During Deployment

### Issue: Service Fails to Build

**In Render Dashboard**:
1. Click on the failing service
2. Click **Logs** tab
3. Scroll to **Build Logs**
4. Read the error message
5. Fix the issue in your code
6. Push to GitHub
7. Render auto-retries

### Issue: Frontend Can't Connect to PDF Server

**Verify**:
1. PDF server is deployed (should be "Live")
2. `VITE_PDF_API_URL` matches your PDF server URL exactly
3. Frontend has been redeployed after config change

### Issue: Second Request Still Takes Long

**This is normal** on Free tier - services spin down after 15 minutes.
Next request takes 30 seconds as service wakes up.

---

## 📚 Documentation Reference

| Question | Document |
|----------|----------|
| "How do I set up locally?" | COMPLETE_SETUP_GUIDE.md |
| "What if something breaks?" | RENDER_DEPLOYMENT_GUIDE.md → Troubleshooting |
| "How do I test the PDF server?" | LOCAL_PDF_SETUP.md |
| "What files were created?" | IMPLEMENTATION_COMPLETE.md |
| "What's the technical architecture?" | IMPLEMENTATION_COMPLETE.md |

---

## ⏱️ Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Local Setup | 5 min | ✅ |
| Local Testing | 5 min | ✅ |
| Prepare for Deploy | 3 min | ✅ |
| Deploy Frontend | 3-5 min | ✅ |
| Deploy PDF Server | 3-5 min | ✅ |
| Final Config | 2 min | ✅ |
| **TOTAL** | **~20 min** | **✅** |

---

## 🎯 What's Next?

### Right After Deployment
- [ ] Test the live app thoroughly
- [ ] Check logs for any warnings
- [ ] Share the URL with a friend to test

### This Week
- [ ] Monitor Render dashboard for issues
- [ ] Collect user feedback
- [ ] Make any necessary fixes

### This Month
- [ ] Consider upgrading to Starter plan if many users
- [ ] Add any additional features
- [ ] Set up production domain if needed

---

## 💡 Pro Tips

1. **Bookmark these URLs**:
   - Frontend: `https://qgen-frontend.onrender.com`
   - Dashboard: `https://dashboard.render.com`
   - GitHub: Your repo URL

2. **Monitor your app**:
   - Check Render logs regularly
   - Watch for error messages
   - Monitor resource usage

3. **Keep code organized**:
   - Push changes to GitHub frequently
   - Use meaningful commit messages
   - Keep documentation updated

---

## 🆘 Quick Help Links

- **Can't login to Render?**: Use your GitHub account
- **Port already in use?**: Kill process or use different port
- **PDF button not showing?**: Clear browser cache (Ctrl+Shift+Delete)
- **Server takes long to respond?**: Free tier service may be sleeping
- **Other issues?**: Check the detailed guides above

---

## ✨ You Did It!

You now have a **production-ready, cloud-hosted** Question Paper Generator with PDF downloads!

This is a complete, working application that you can:
- ✅ Share with teachers
- ✅ Share with students
- ✅ Use internationally (it's on the internet!)
- ✅ Modify and improve
- ✅ Scale up if needed

---

**Start Here**: Go back to [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) for detailed setup instructions

**Deployment Help**: Check [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) for detailed troubleshooting

---

**Version**: 1.0.0  
**Last Updated**: February 18, 2026  
**Status**: Ready for Production ✅
