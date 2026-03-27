import puppeteer from 'puppeteer';

const getPuppeteerConfig = () => {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const args = (process.env.PUPPETEER_ARGS || '--no-sandbox,--disable-setuid-sandbox').split(',');
  
  const config = {
    headless: process.env.PUPPETEER_HEADLESS === 'true',
    args: [
      ...args,
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--start-maximized'
    ]
  };
  
  if (executablePath && executablePath !== '') {
    config.executablePath = executablePath;
  }
  
  return config;
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

    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // Updated delay fix for Puppeteer v24+
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
