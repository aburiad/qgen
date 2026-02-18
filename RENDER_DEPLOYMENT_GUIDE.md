# Complete Render Deployment Guide for Question Paper Generator

## 📋 Overview

This guide walks you through deploying your Question Paper Generator application (React Frontend + Node.js PDF Server) to Render.com.

**What You'll Deploy:**
- **Frontend**: React + Vite web application (question paper builder)
- **Backend**: Node.js + Express + Puppeteer (PDF generation server)

---

## 🔧 Prerequisites

Before you start, make sure you have:

1. **GitHub Account** - For connecting to Render
2. **Render Account** - Free at https://render.com
3. **Git Installed** - For pushing code to GitHub
4. **Project Structure** - Your code should be uploaded to GitHub
   ```
   your-repo/
   ├── src/                    (React frontend)
   ├── server/                 (Node.js backend)
   ├── index.html
   ├── package.json           (frontend)
   ├── vite.config.ts
   └── server/package.json    (backend)
   ```

---

## 📝 Step 1: Prepare Your Code

### 1.1 Update Frontend Package.json (if not already done)

Make sure your root `package.json` has correct scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 1.2 Verify Server Package.json

Your `server/package.json` should have:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "puppeteer": "^21.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### 1.3 Create .env.production File

In your root directory, create `.env.production`:

```env
VITE_PDF_API_URL=https://your-pdf-server.onrender.com
```

(Replace `your-pdf-server` with your actual Render service name)

### 1.4 Create render.yaml (Optional but Recommended)

In your root directory, create `render.yaml`:

```yaml
services:
  - type: web
    name: qgen-frontend
    plan: free
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm install -g serve && serve -s dist
    envVars:
      - key: VITE_PDF_API_URL
        value: https://qgen-pdf-server.onrender.com

  - type: web
    name: qgen-pdf-server
    plan: free
    runtime: node
    root: server
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: FRONTEND_URL
        value: https://qgen-frontend.onrender.com
```

### 1.5 Push to GitHub

```bash
git add .
git commit -m "Add Render configuration and PDF server setup"
git push origin main
```

---

## 🚀 Step 2: Deploy Frontend to Render

### 2.1 Create Frontend Service

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Select your GitHub repository and click **Connect**
4. Fill in the details:
   - **Name**: `qgen-frontend` (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm install -g serve && serve -s dist`
   - **Plan**: Free (sufficient for testing)

### 2.2 Add Environment Variables

1. In Render dashboard, go to your frontend service
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. Add:
   - **Key**: `VITE_PDF_API_URL`
   - **Value**: `https://qgen-pdf-server.onrender.com` (update with your PDF server name)

### 2.3 Deploy

1. Click **Create Web Service**
2. Render will start the deployment process
3. Wait for the build to complete (usually 2-3 minutes)
4. Once done, you'll see a live URL like: `https://qgen-frontend.onrender.com`

✅ **Frontend is now live!**

---

## 🖨️ Step 3: Deploy PDF Server to Render

### 3.1 Create PDF Server Service

1. Go back to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Select the same GitHub repository
4. Fill in the details:
   - **Name**: `qgen-pdf-server` (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server` (very important!)
   - **Plan**: Free

### 3.2 Add Environment Variables

1. In Render dashboard, go to your PDF server service
2. Click **Environment** tab
3. Add these variables:
   ```
   NODE_ENV = production
   PORT = 5001
   FRONTEND_URL = https://qgen-frontend.onrender.com
   ```

### 3.3 Deploy

1. Click **Create Web Service**
2. Wait for the deployment to complete
3. You'll see a URL like: `https://qgen-pdf-server.onrender.com`

✅ **PDF Server is now live!**

---

## 🔄 Step 4: Update Frontend Configuration

### 4.1 Update .env.production

1. Edit your `.env.production` file with the correct PDF server URL:

```env
VITE_PDF_API_URL=https://qgen-pdf-server.onrender.com
```

(Use the exact URL from your PDF server)

### 4.2 Commit and Push

```bash
git add .env.production
git commit -m "Update PDF server URL for production"
git push origin main
```

### 4.3 Redeploy Frontend

1. Go to your qgen-frontend service in Render
2. Click **Manual Deploy** → **Deploy Latest Commit**
3. Wait for the redeploy to complete

---

## 🧪 Step 5: Test Your Application

### 5.1 Test Frontend

1. Open: https://qgen-frontend.onrender.com
2. Create a new question paper
3. You should see both print and PDF buttons

### 5.2 Test PDF Server

1. Open: https://qgen-pdf-server.onrender.com
2. You should see:
   ```json
   {
     "success": true,
     "message": "Question Paper PDF Generator Server",
     "version": "1.0.0",
     "endpoints": {
       "health": "GET /api/pdf/health",
       "generatePDF": "POST /api/pdf/generate",
       "generateQuestionPaper": "POST /api/pdf/question-paper"
     }
   }
   ```

### 5.3 Test PDF Generation

1. In your frontend application
2. Create a question paper
3. Click the **"PDF ডাউনলোড করুন"** button
4. The PDF should start downloading

✅ **Everything is working!**

---

## 📊 Monitoring and Logs

### View Service Logs

1. Go to Render dashboard
2. Click on your service (qgen-frontend or qgen-pdf-server)
3. Click **Logs** tab
4. You'll see real-time logs

### Common Log Messages

**PDF Server starting:**
```
PDF Generator Server running on http://localhost:5001
CORS enabled for: https://qgen-frontend.onrender.com
Environment: production
```

**PDF generation:**
```
POST /api/pdf/question-paper 200 ← Success
POST /api/pdf/question-paper 500 ← Error (check details)
```

---

## 🐛 Troubleshooting

### Issue 1: PDF Button Not Appearing

**Solution:**
- Clear browser cache
- Rebuild frontend: Go to frontend service → **Manual Deploy** → **Deploy Latest**
- Check environment variables are set correctly

### Issue 2: PDF Download Fails (500 Error)

**Check the logs:**
1. Go to PDF server service
2. Look for error messages in **Logs** tab
3. Common issues:
   - `Puppeteer: not installed` → PDF server build failed, redeploy
   - `CORS blocked` → Check FRONTEND_URL environment variable
   - `HTML parsing failed` → Invalid HTML content sent

**Solution:**
1. Redeploy PDF server: Right-click service → **Redeploy**
2. Verify environment variables
3. Check PDF server logs for specific errors

### Issue 3: CORS Error in Browser Console

**Error message:** `"Access to XMLHttpRequest blocked by CORS policy"`

**Solution:**
1. Check PDF server `index.js` has correct CORS configuration
2. Verify `FRONTEND_URL` environment variable matches your frontend URL exactly
3. Redeploy PDF server after any changes

### Issue 4: Free Tier Service Spins Down

Render's free tier spins down services after 15 minutes of inactivity.

**Solutions:**
1. Upgrade to Eternal Plan (more reliable)
2. Use a monitoring/ping service to keep it active
3. Or accept the 30-second startup delay

### Issue 5: Build Fails on Render

**Check build logs:**
1. Go to Render dashboard
2. Click on service
3. Click **Logs** → **Build Logs**
4. Look for errors

**Common causes:**
- Missing dependencies in `package.json`
- Invalid Node.js syntax
- Missing environment variables

**Solution:**
- Test locally first: `npm install && npm run build`
- Fix the error
- Commit and push to GitHub
- Render will auto-redeploy

---

## 📈 Performance Tips

1. **Frontend Optimization:**
   - Code splitting is automatic with Vite
   - Use `npm run build` to see bundle size

2. **PDF Server Optimization:**
   - Puppeteer is resource-intensive
   - Free tier has limited resources
   - Consider upgrading if you have high traffic

3. **Reduce Bundle Size:**
   - Remove unused dependencies
   - Use dynamic imports for large components

---

## 🔐 Security Considerations

1. **Environment Variables:**
   - Don't commit `.env.production` to public repos
   - Use Render's environment variable management

2. **CORS:**
   - Currently set to allow your frontend
   - Don't expose to untrusted domains

3. **Rate Limiting:**
   - Consider adding rate limiting if using paid tier
   - Free tier has natural rate limiting

---

## 💰 Costs

**Free Tier (Current Setup):**
- Frontend Web Service: Free
- PDF Server Web Service: Free
- **Total**: $0/month
- **Limitation**: Services spin down after 15 minutes of inactivity

**Starter Plan (Recommended for Production):**
- Each service: $7/month
- **Total**: $14/month (1 frontend + 1 PDF server)
- **Benefits**: Always running, better performance

---

## 📞 Next Steps

1. ✅ Deploy frontend to Render
2. ✅ Deploy PDF server to Render
3. ✅ Test the application
4. ✅ Monitor logs and fix any issues
5. 📈 Consider upgrading to Starter plan for production
6. 🔄 Set up auto-deploy on GitHub push

---

## 🆘 Getting Help

**Render Documentation:**
- https://docs.render.com

**Puppeteer Issues:**
- https://github.com/puppeteer/puppeteer/issues

**Express/Node.js Issues:**
- https://expressjs.com/

**Your Application Logs:**
- Check Render dashboard → Service → Logs

---

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `.env.production` file created with correct PDF API URL
- [ ] Frontend service created on Render
- [ ] Frontend environment variables set
- [ ] PDF server service created on Render
- [ ] PDF server environment variables set
- [ ] Frontend redeployed with latest configuration
- [ ] Both services show as "Live" on Render
- [ ] Frontend URL accessible in browser
- [ ] PDF server health endpoint responding
- [ ] PDF generation tested in application
- [ ] Logs checked for any errors

---

## 🎉 Success!

Your Question Paper Generator is now live on the internet! You can share the frontend URL with others, and they can start creating and downloading question papers as PDFs.

**Frontend URL:** `https://qgen-frontend.onrender.com`

Happy teaching! 📚
