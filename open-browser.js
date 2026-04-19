const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // 打开仓库页面
  await page.goto('https://gitee.com/liang6/suanzhang', { waitUntil: 'networkidle', timeout: 30000 });
  
  // 截图看看当前页面
  await page.screenshot({ path: 'C:\\Users\\UserComputer\\.openclaw\\workspace\\suanzhang\\debug1.png', fullPage: false });
  console.log('Screenshot saved: debug1.png');
  
  // 查找包含 "Pages" 或 "pages" 的链接/按钮
  const links = await page.$$eval('a, button', els => 
    els.filter(el => el.textContent.includes('Pages') || el.textContent.includes('pages') || el.textContent.includes('page'))
         .map(el => ({ tag: el.tagName, text: el.textContent.trim().substring(0, 50), href: el.href || '' }))
  );
  console.log('Pages-related elements:', JSON.stringify(links, null, 2));

  // 查找"服务"相关
  const serviceLinks = await page.$$eval('a, button', els =>
    els.filter(el => el.textContent.includes('服务'))
         .map(el => ({ tag: el.tagName, text: el.textContent.trim().substring(0, 50), href: el.href || '' }))
  );
  console.log('Service-related elements:', JSON.stringify(serviceLinks, null, 2));

  // 查找所有导航链接
  const allLinks = await page.$$eval('a', els =>
    els.map(el => ({ text: el.textContent.trim().substring(0, 50), href: el.href || '' }))
       .filter(l => l.text)
  );
  console.log('All links:', JSON.stringify(allLinks.slice(0, 20), null, 2));

  // keep browser open for user
  console.log('Browser kept open. Check screenshots and output.');
  
  // Wait for user action
  await new Promise(resolve => setTimeout(resolve, 120000));
  await browser.close();
})();
