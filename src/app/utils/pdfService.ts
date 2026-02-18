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
   * Generate question paper PDF
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
      const response = await fetch(`${API_BASE_URL}/api/pdf/question-paper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent,
          paperTitle,
          pdfOptions: options,
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
