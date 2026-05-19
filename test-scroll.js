import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:5173/my-playwright-tutorial/', { waitUntil: 'networkidle0' });
  
  const badElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const overflowing = [];
    const windowWidth = document.documentElement.clientWidth;
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > windowWidth || rect.width > windowWidth) {
        overflowing.push({
          tag: el.tagName,
          className: el.className,
          right: rect.right,
          width: rect.width,
          windowWidth
        });
      }
    });
    return overflowing;
  });
  
  console.log("Landing page overflowing elements:", badElements);
  
  await page.goto('http://localhost:5173/my-playwright-tutorial/docs/Locators/playwright-locators', { waitUntil: 'networkidle0' });
  
  const badElements2 = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const overflowing = [];
    const windowWidth = document.documentElement.clientWidth;
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > windowWidth || rect.width > windowWidth) {
        overflowing.push({
          tag: el.tagName,
          className: el.className,
          right: rect.right,
          width: rect.width,
          windowWidth
        });
      }
    });
    return overflowing;
  });
  
  console.log("Docs page overflowing elements:", badElements2);
  
  await browser.close();
})();
