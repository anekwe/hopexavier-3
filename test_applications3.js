import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000/admin/dashboard/applications', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 20000)); // Wait 20 seconds!

  const content = await page.content();
  if (content.includes("No applications found.")) {
      console.log('NO APPLICATIONS FOUND');
  } else if (content.includes("Network timeout")) {
      console.log('NETWORK TIMEOUT');
  } else if (content.includes("Loading applications...")) {
      console.log('LOADING APPLICATIONS');
  } else {
      console.log('SOMETHING ELSE');
  }
  
  await browser.close();
})();
