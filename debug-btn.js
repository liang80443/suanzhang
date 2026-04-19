const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  
  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

  await page.goto('https://liang80443.github.io/suanzhang/', { waitUntil: 'networkidle', timeout: 30000 });
  
  // 检查当前页面版本 - 看看是不是新版
  const hasGradBtn = await page.locator('text=算算我该拿多少').count();
  const hasOldBtn = await page.locator('text=算算').count();
  console.log('新版按钮数:', hasGradBtn, '| 旧版按钮数:', hasOldBtn);
  
  // 检查 calcOvertime 函数是否存在
  const fnExists = await page.evaluate(() => typeof calcOvertime);
  console.log('calcOvertime 函数:', fnExists);
  
  // 检查 #ot-salary 是否存在
  const salaryExists = await page.locator('#ot-salary').count();
  console.log('#ot-salary 存在:', salaryExists);
  
  // 尝试用 JS 直接调用
  try {
    const result = await page.evaluate(() => {
      document.getElementById('ot-salary').value = '10000';
      document.getElementById('ot-weekday').value = '10';
      calcOvertime();
      return document.getElementById('ot-result').innerHTML.substring(0, 100);
    });
    console.log('JS直接调用结果:', result);
  } catch(e) {
    console.log('JS直接调用失败:', e.message);
  }

  // 尝试模拟点击
  try {
    await page.fill('#ot-salary', '10000');
    await page.fill('#ot-weekday', '10');
    await page.click('#tab-overtime .btn');
    await page.waitForTimeout(2000);
    const resultText = await page.textContent('#ot-result');
    console.log('点击后结果区内容:', resultText.trim().substring(0, 100) || '(空)');
  } catch(e) {
    console.log('点击失败:', e.message);
  }
  
  await page.screenshot({ path: 'C:\\Users\\UserComputer\\.openclaw\\workspace\\suanzhang\\debug-btn.png' });
  console.log('截图已保存');
  
  await new Promise(r => setTimeout(r, 120000));
  await browser.close();
})();
