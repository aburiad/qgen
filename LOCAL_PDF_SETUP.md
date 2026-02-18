# Local PDF Server Setup & Testing Guide

This guide helps you run the PDF server locally during development.

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Create Server .env File

Create `server/.env` with:

```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PUPPETEER_HEADLESS=true
```

### 3. Start Both Services

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Frontend will be at: `http://localhost:5173`

**Terminal 2 - PDF Server:**
```bash
cd server
npm start
```
Server will be at: `http://localhost:5001`

### 4. Test PDF Generation

1. Open frontend: `http://localhost:5173`
2. Create a question paper
3. Click **"PDF ডাউনলোড করুন"** button
4. PDF should download

---

## 🧪 Testing PDF Server Manually

### Check Server Health

```bash
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

### Generate PDF from HTML

```bash
curl -X POST http://localhost:5001/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<h1>Test Question Paper</h1><p>This is a test</p>",
    "filename": "test.pdf"
  }' \
  --output test.pdf
```

Then check if `test.pdf` was created.

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module 'puppeteer'"

**Solution:**
```bash
cd server
npm install puppeteer
```

### Issue: "EADDRINUSE: address already in use :::5001"

**Solution:**
Port 5001 is already in use. Either:
1. Kill the process using port 5001
2. Change PORT in `server/.env`

**Windows:**
```bash
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :5001
kill -9 <PID>
```

### Issue: "Cannot launch Chrome/Chromium"

**Solution:**
Puppeteer needs a display. If on headless Linux:

```env
PUPPETEER_ARGS=--no-sandbox
```

Or install Chrome:
```bash
apt-get update
apt-get install -y chromium
```

### Issue: PDF Button Shows "Generating PDF..." Forever

**Check PDF server logs:**
1. Look at Terminal 2 output
2. Verify `FRONTEND_URL` matches frontend address
3. Check browser console for CORS errors

---

## 📦 Local Build & Test

If you want to test the production build locally:

### 1. Build Frontend

```bash
npm run build
```

### 2. Install Global Serve

```bash
npm install -g serve
```

### 3. Run Production Frontend Build

```bash
serve -s dist
```

Frontend will be at: `http://localhost:3000`

### 4. Run PDF Server with Production URL

Update `server/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

Then:
```bash
cd server
npm start
```

### 5. Test

Open `http://localhost:3000` and test PDF generation.

---

## 🐛 Debugging

### Enable Debug Logs

Modify `server/utils/puppeteerConfig.js`:

```javascript
export const generatePDFFromHTML = async (htmlContent, pdfOptions = {}) => {
  console.log('Generating PDF with content length:', htmlContent.length);
  console.log('PDF Options:', pdfOptions);
  
  // ... rest of code
};
```

### Monitor Network Traffic

In browser DevTools:
1. Open **Network** tab
2. Create a question paper
3. Click PDF download
4. Watch the request to `/api/pdf/question-paper`
5. Check response status and timing

---

## 📝 Environment Variables Reference

### Frontend (.env.local)

```env
VITE_PDF_API_URL=http://localhost:5001
```

### Server (server/.env)

```env
# Server Config
PORT=5001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_EXECUTABLE_PATH=              # Optional: Path to Chrome
PUPPETEER_ARGS=--no-sandbox             # For headless Linux
```

---

## ✅ Verification Checklist

- [ ] Both servers started without errors
- [ ] Frontend loads at `http://localhost:5173`
- [ ] PDF server responds at `http://localhost:5001/api/pdf/health`
- [ ] Can create a question paper
- [ ] PDF download button is visible
- [ ] Clicking PDF button generates PDF
- [ ] PDF downloads to computer
- [ ] PDF opens correctly

---

## 🚀 Ready for Deployment?

Once everything works locally:
1. Commit all changes to Git
2. Push to GitHub
3. Follow [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
4. Deploy to Render

---

Need more help? Check:
- [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) - Deployment guide
- [PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md) - Pagination documentation
- [README.md](./README.md) - Project overview
