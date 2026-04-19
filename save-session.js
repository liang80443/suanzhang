const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto('https://gitee.com/liang6/suanzhang', { waitUntil: 'networkidle', timeout: 30000 });
  
  // 截图确认已登录
  await page.screenshot({ path: 'C:\\Users\\UserComputer\\.openclaw\\workspace\\suanzhang\\debug2.png', fullPage: false });
  
  // 检查登录状态
  const loggedIn = await page.$eval('.git-nav-user, .avatar, [data-user-login]', els => els.length > 0).catch(() => false);
  console.log('Logged in:', loggedIn);

  // 保存 cookies
  const cookies = await ctx.cookies();
  fs.writeFileSync('C:\\Users\\UserComputer\\.openclaw\\workspace\\suanzhang\\gitee-cookies.json', JSON.stringify(cookies, null, 2));
  console.log(`Saved ${cookies.length} cookies`);
  
  // 保存 localStorage
  const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
  fs.writeFileSync('C:\\Users\\UserComputer\\.openclaw\\workspace\\suanzhang\\gitee-storage.json', localStorage);
  console.log('Saved localStorage');

  // 查找 Pages 入口
  const allText = await page.$$eval('a, button, span, div', els =>
    els.filter(el => {
      const t = el.textContent.trim();
      return t && (t.includes('Pages') || t.includes('pages') || t.includes('Gitee Pages') || t.includes('服务'));
    })
    .slice(0, 20)
    .map(el => ({ tag: el.tagName, text: el.textContent.trim().substring(0, 60), href: el.href || '', class: el.className.substring(0, 80) }))
  );
  console.log('Found elements:', JSON.stringify(allText, null, 2));

  await browser.close();
})();
