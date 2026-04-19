const { chromium } = require('playwright');

(async () => {
  // 连接已有的 Edge 浏览器（需要 Edge 以远程调试模式启动）
  // 先尝试用 persistent context 复用 Edge 的用户数据目录
  const userDataDir = 'C:\\Users\\UserComputer\\AppData\\Local\\Microsoft\\Edge\\User Data';
  
  const ctx = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    channel: 'msedge',
    viewport: { width: 1280, height: 800 },
    args: ['--profile-directory=Default']
  });
  
  const page = await ctx.newPage();
  await page.goto('https://github.com/liang80443/suanzhang/settings/pages', { waitUntil: 'networkidle', timeout: 30000 });
  
  await page.screenshot({ path: 'C:\\Users\\UserComputer\\.openclaw\\workspace\\suanzhang\\gh-pages3.png', fullPage: false });
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log(text);
  
  // 保持浏览器打开
  await new Promise(r => setTimeout(r, 120000));
  await ctx.close();
})();
