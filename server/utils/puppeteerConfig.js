import puppeteer from 'puppeteer';
const getPuppeteerConfig = () => {
  return {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  };
};

export const generatePDFFromHTML = async (htmlContent, pdfOptions = {}) => {
  let browser;
  try {
    const config = getPuppeteerConfig();
    browser = await puppeteer.launch(config);
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1200,
      height: 1600
    });

    // Set content with longer wait for fonts and CSS to load
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // Extra delay to ensure web fonts are loaded
    await page.waitForTimeout(1000);
    
    // Inject additional font loading check
    await page.evaluateOnNewDocument(() => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          console.log('Fonts loaded');
        });
      }
    });

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
      preferCSSPageSize: true,
      displayHeaderFooter: false
    };

    const finalOptions = { ...defaultPdfOptions, ...pdfOptions };
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
