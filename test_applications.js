import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list'] 
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });

  await page.goto('http://localhost:3000/admin/dashboard/applications', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000)); // Wait for data to load

  const content = await page.content();
  if (content.includes("Loading applications...")) {
      console.log('STILL LOADING');
  } else {
      console.log('NOT LOADING');
  }
  
  await browser.close();
})();
