import express from 'express';
import { generatePDF, generateQuestionPaper, healthCheck } from '../controllers/pdfController.js';

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Generate PDF from HTML
router.post('/generate', generatePDF);

// Generate question paper PDF
router.post('/question-paper', generateQuestionPaper);

export default router;
