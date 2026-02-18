import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pdfRoutes from './routes/pdfRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/pdf', pdfRoutes);

// Health check root endpoint
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PDF Generator Server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for: ${FRONTEND_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
