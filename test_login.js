import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin');
  
  await page.fill('input#email', 'hopexavier@gmail.com');
  await page.fill('input#password', 'prince_1981');
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));
  
  await page.click('button[type="submit"]');
  
  // wait 5 seconds to see what happens
  await page.waitForTimeout(5000);
  
  const content = await page.content();
  console.log("Current URL:", page.url());
  console.log("Header text:", await page.locator('h1').textContent().catch(() => 'none'));
  console.log("Button text:", await page.locator('button[type="submit"]').textContent().catch(() => 'none'));
  
  await browser.close();
})();
