const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = process.env.BASE_URL || 'http://localhost:3000';
  console.log('Opening IDE at', `${base}/ide`);
  await page.goto(`${base}/ide`, { waitUntil: 'networkidle' });
  // Wait for the page chrome and Monaco to initialize
  await page.waitForSelector('text=Source Code', { timeout: 20000 });
  // Monaco editor uses nested elements; wait for the view-lines element which contains the editor text
  await page.waitForSelector('.view-lines, .monaco-editor', { timeout: 20000 });

  // Focus the editor by clicking the view-lines if present, otherwise the monaco-editor container
  const viewLines = await page.$('.view-lines');
  if (viewLines) {
    await viewLines.click();
  } else {
    await page.click('.monaco-editor');
  }

  // Select all and replace with our test code (works on Windows with Control)
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  // Small pause to ensure selection processed
  await page.waitForTimeout(100);
  const code = `ye a = 5\nbol a`;
  await page.keyboard.type(code, { delay: 20 });

  // Click Compile & Run
  await page.click('text=Compile & Run');

  // Wait for the output to contain '5'
  await page.waitForFunction(() => {
    const pre = document.querySelector('pre');
    return pre && pre.innerText.includes('5');
  }, { timeout: 10000 });

  const preText = await page.$eval('pre', el => el.innerText);
  console.log('Output area contains:', preText);

  if (!preText.includes('5')) {
    console.error('Test failed: output does not include 5');
    await browser.close();
    process.exit(1);
  }

  console.log('Test passed: IDE displays output correctly');
  await browser.close();
  process.exit(0);
})().catch(async (e) => {
  console.error('Test error:', e);
  process.exit(1);
});