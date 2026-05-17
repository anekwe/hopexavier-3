import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const content = await page.content();
  console.log('App DOM length:', content.length);
  console.log('Has root child?', content.includes('id="root"><div'));
  
  await browser.close();
})();
