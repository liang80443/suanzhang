# 码云 Gitee 登录信息

- **用户名**: liang6
- **仓库**: https://gitee.com/liang6/suanzhang
- **Cookies**: `suanzhang/gitee-cookies.json`（Playwright cookies，可用 ctx.addCookies() 恢复）
- **LocalStorage**: `suanzhang/gitee-storage.json`
- **注意**: Gitee Pages 已下架，需用其他方案部署网站

## 使用方法

```javascript
const { chromium } = require('playwright');
const cookies = require('./gitee-cookies.json');
const browser = await chromium.launch({ headless: false, executablePath: '...' });
const ctx = await browser.newContext();
await ctx.addCookies(cookies);
const page = await ctx.newPage();
await page.goto('https://gitee.com/liang6/suanzhang');
// 已登录状态
```

## 2026-04-19 备注
- Gitee 服务菜单中已无 Pages 选项
- 可选替代：Cloudflare Pages / GitHub Pages / Vercel
