// API service for PDF generation
const API_BASE_URL = import.meta.env.VITE_PDF_API_URL || 'http://localhost:5001';

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  scale?: number;
}

export const pdfService = {
  /**
   * Generate PDF from HTML content
   * @param htmlContent - HTML content as string
   * @param filename - Output filename (default: 'document.pdf')
   * @param options - Puppeteer PDF options
   */
  async generatePDF(
    htmlContent: string,
    filename: string = 'document.pdf',
    options: PDFGenerationOptions = {}
  ): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent,
          filename,
          pdfOptions: options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate PDF');
      }

      return await response.blob();
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  },

  /**
   * Generate question paper PDF with styles
   * @param htmlContent - HTML content of the question paper
   * @param paperTitle - Title for the PDF file
   * @param options - Puppeteer PDF options
   */
  async generateQuestionPaper(
    htmlContent: string,
    paperTitle: string = 'Question_Paper',
    options: PDFGenerationOptions = {}
  ): Promise<Blob> {
    try {
      // Add comprehensive styles to HTML for PDF
      const styledHtml = `
        <!DOCTYPE html>
        <html lang="bn">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;700&family=Noto+Sans+Bengali:wght@400;700&family=Noto+Serif:wght@400;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html {
              background: white;
              color: #000;
            }
            
            body {
              font-family: 'Noto Serif Bengali', 'Noto Sans Bengali', 'Noto Serif', 'Arial', serif;
              line-height: 1.5;
              color: #000;
              background: white;
              font-size: 14px;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Board Exam Paper Styles */
            .board-exam-paper {
              font-family: 'Noto Serif Bengali', 'Noto Sans Bengali', serif;
              font-size: 16px;
              line-height: 1.4;
              color: #000;
              background: white;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .board-header {
              margin-bottom: 15px;
              padding-bottom: 10px;
            }
            
            .text-center {
              text-align: center;
            }
            
            .mb-4 {
              margin-bottom: 16px;
            }
            
            .mb-1 {
              margin-bottom: 4px;
            }
            
            .pb-2 {
              padding-bottom: 8px;
            }
            
            .border-b {
              border-bottom: 1px solid #ddd;
            }
            
            .border-gray-300 {
              border-color: #ddd !important;
            }
            
            .text-xl {
              font-size: 20px;
            }
            
            .text-lg {
              font-size: 18px;
            }
            
            .text-sm {
              font-size: 12px;
            }
            
            .text-xs {
              font-size: 11px;
            }
            
            .font-bold {
              font-weight: 700;
            }
            
            .font-semibold {
              font-weight: 600;
            }
            
            .flex {
              display: flex;
              flex-wrap: wrap;
            }
            
            .justify-center {
              justify-content: center;
            }
            
            .justify-between {
              justify-content: space-between;
            }
            
            .gap-6 {
              gap: 24px;
            }
            
            .gap-8 {
              gap: 32px;
            }
            
            .mt-1 {
              margin-top: 4px;
            }
            
            .mt-2 {
              margin-top: 8px;
            }
            
            .italic {
              font-style: italic;
            }
            
            /* Board Columns */
            .board-columns {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0;
              height: auto;
            }
            
            .board-column {
              display: flex;
              flex-direction: column;
              gap: 0;
            }
            
            /* Questions */
            .question-item {
              font-size: 16px;
              page-break-inside: avoid;
              margin-bottom: 8px;
              color: #000;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .board-question {
              margin-bottom: 8px;
              page-break-inside: avoid;
              color: #000;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .creative-question {
              /* Creative question styling */
            }
            
            .board-uddipok {
              display: flex;
              gap: 6px;
              margin: 4px 0 6px 0;
              padding: 4px 0;
              font-size: 14px;
              line-height: 1.4;
              color: #000;
            }
            
            .board-question-number {
              font-weight: 700;
              font-size: 14px;
              flex-shrink: 0;
              padding-top: 0;
              color: #000;
            }
            
            .board-block {
              margin: 2px 0;
              font-family: 'Noto Serif Bengali', 'Noto Sans Bengali', serif;
              font-size: 14px;
              line-height: 1.4;
              color: #000;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Subquestions */
            .board-subquestions {
              margin-top: 4px;
              margin-left: 8px;
              color: #000;
            }
            
            .board-subquestion {
              margin-bottom: 4px;
              display: flex;
              gap: 4px;
              align-items: flex-start;
              page-break-inside: avoid;
              color: #000;
            }
            
            .board-subquestion-label {
              font-weight: 700;
              min-width: 12px;
              flex-shrink: 0;
              font-size: 13px;
              color: #000;
            }
            
            .board-subquestion-content {
              flex: 1;
              line-height: 1.4;
              font-size: 14px;
              color: #000;
            }
            
            .board-subquestion-marks {
              font-size: 13px;
              flex-shrink: 0;
              min-width: 20px;
              text-align: center;
              color: #000;
              font-weight: 600;
            }
            
            /* Generic styles */
            h1, h2, h3, h4, h5, h6 {
              font-family: 'Noto Serif Bengali', 'Noto Sans Bengali', serif;
              font-weight: 700;
              margin-bottom: 6px;
              margin-top: 4px;
              color: #000;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            h1 { font-size: 20px; }
            h2 { font-size: 18px; }
            h3 { font-size: 16px; }
            h4 { font-size: 14px; }
            
            p {
              margin-bottom: 8px;
              color: #000;
              line-height: 1.4;
            }
            
            strong, b {
              font-weight: 700;
              font-family: 'Noto Serif Bengali', 'Noto Sans Bengali', serif;
              color: #000;
            }
            
            em, i {
              font-style: italic;
            }
            
            span {
              color: inherit;
              font-family: 'Noto Serif Bengali', 'Noto Sans Bengali', serif;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            ul, ol {
              margin: 6px 0 6px 24px;
              padding: 0;
              list-style-position: outside;
              color: #000;
            }
            
            li {
              margin: 4px 0;
              color: #000;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 8px 0;
            }
            
            table tr {
              page-break-inside: avoid;
            }
            
            table td, table th {
              padding: 6px 4px;
              text-align: left;
              color: #000;
              font-size: 13px;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            th {
              background-color: #f0f0f0;
              font-weight: 700;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            hr {
              border: none;
              border-top: 1px solid #999;
              margin: 8px 0;
            }
            
            @media print {
              * {
                background: white !important;
                color: #000 !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              html, body {
                margin: 0;
                padding: 0;
                background: white;
              }
              
              .board-exam-paper {
                page-break-after: always;
              }
              
              .board-columns {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0;
              }
              
              .board-question {
                page-break-inside: avoid;
              }
              
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
              }
              
              table {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      const response = await fetch(`${API_BASE_URL}/api/pdf/question-paper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent: styledHtml,
          paperTitle,
          pdfOptions: {
            format: 'A4',
            margin: {
              top: '15mm',
              right: '10mm',
              bottom: '15mm',
              left: '10mm'
            },
            printBackground: true,
            scale: 1,
            preferCSSPageSize: true,
            ...options
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate question paper PDF');
      }

      return await response.blob();
    } catch (error) {
      console.error('Question paper PDF generation error:', error);
      throw error;
    }
  },

  /**
   * Trigger download of a blob as a file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Health check to verify server is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pdf/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
