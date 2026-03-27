import { generatePDFFromHTML } from '../utils/puppeteerConfig.js';

// Helper: sanitize filename
const sanitizeFilename = (name) => {
  return name.replace(/[^a-z0-9_\-\.]/gi, '_');
};

export const generatePDF = async (req, res) => {
  try {
    const { htmlContent, filename = 'document.pdf', pdfOptions = {} } = req.body;

    if (!htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'HTML content is required'
      });
    }

    const pdfBuffer = await generatePDFFromHTML(htmlContent, pdfOptions);

    const safeFilename = sanitizeFilename(filename);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    if (pdfBuffer?.length) {
      res.setHeader('Content-Length', pdfBuffer.length);
    }

    res.end(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
};

export const generateQuestionPaper = async (req, res) => {
  try {
    const { 
      htmlContent, 
      paperTitle = 'Question_Paper', 
      pdfOptions = {} 
    } = req.body;

    if (!htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'HTML content is required'
      });
    }

    const timestamp = Date.now();
    const safeTitle = sanitizeFilename(paperTitle);
    const filename = `${safeTitle}_${timestamp}.pdf`;

    const defaultOptions = {
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      printBackground: true,
      scale: 1,
      preferCSSPageSize: true
    };

    const finalOptions = { ...defaultOptions, ...pdfOptions };

    const pdfBuffer = await generatePDFFromHTML(htmlContent, finalOptions);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    if (pdfBuffer?.length) {
      res.setHeader('Content-Length', pdfBuffer.length);
    }

    res.end(pdfBuffer);

  } catch (error) {
    console.error('Question paper PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate question paper PDF',
      error: error.message
    });
  }
};

export const healthCheck = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PDF Server is running',
    timestamp: new Date().toISOString()
  });
};
