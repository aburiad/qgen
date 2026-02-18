const puppeteer = require('puppeteer');
import puppeteer from 'puppeteer';

export const getPuppeteerConfig = () => {
  const config = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  };

  // If PUPPETEER_EXECUTABLE_PATH is set, use custom Chrome path
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  return config;
};

export const generatePDFFromHTML = async (htmlContent, pdfOptions = {}) => {
  let browser;
  try {
    const config = getPuppeteerConfig();
    browser = await puppeteer.launch(config);
    const page = await browser.newPage();
    
    // Set viewport for print-friendly rendering
    await page.setViewport({
      width: 1200,
      height: 1600
    });

    // Load the HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Default PDF options
    const defaultPdfOptions = {
      format: 'A4',
      margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in'
      },
      printBackground: true,
      scale: 1,
      preferCSSPageSize: true
    };

    // Merge with provided options
    const finalOptions = { ...defaultPdfOptions, ...pdfOptions };

    // Generate PDF
    const pdfBuffer = await page.pdf(finalOptions);

    await browser.close();
    return pdfBuffer;

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};
