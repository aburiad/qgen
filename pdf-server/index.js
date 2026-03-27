import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pdfRoutes from './routes/pdfRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://proshno-shala.vercel.app';
const allowedOrigins = [FRONTEND_URL];

// ----------------------
// CORS (improved safe version)
// ----------------------
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin, or from allowedOrigins, or from any localhost/127.0.0.1 port
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ----------------------
// Body Parsers
// ----------------------
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ----------------------
// Ping Route (Cloudflare test)
// ----------------------
app.get('/ping', (req, res) => {
  res.send('ok');
});

// ----------------------
// PDF Routes (UNCHANGED)
// ----------------------
app.use('/api/pdf', pdfRoutes);

// ----------------------
// Root Info Endpoint
// ----------------------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Question Paper PDF Generator Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/pdf/health',
      generatePDF: 'POST /api/pdf/generate',
      generateQuestionPaper: 'POST /api/pdf/question-paper'
    }
  });
});

// ----------------------
// 404 Handler
// ----------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// ----------------------
// Error Handler
// ----------------------
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => {
  console.log(`PDF Generator Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${FRONTEND_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
