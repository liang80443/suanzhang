const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const dir = 'C:\\Users\\UserComputer\\.openclaw\\workspace\\suanzhang\\test';
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  let passed = 0, failed = 0;

  const check = (label, ok) => { if (ok) { console.log('   ✅', label); passed++; } else { console.log('   ❌', label); failed++; } };

  console.log('=== 算账 网站测试 ===\n');

  // 1. 首页
  console.log('1️⃣ 首页加载');
  await page.goto('https://liang80443.github.io/suanzhang/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: `${dir}\\01-home.png` });
  check('页面标题', await page.title().then(t => t.includes('算账')));
  check('h1标题', await page.textContent('h1').then(t => t.includes('算账')));
  check('三个tab按钮', await page.locator('.nav button').count().then(n => n === 3));

  // 2. 加班费
  console.log('\n2️⃣ 加班费计算器');
  await page.fill('#ot-salary', '15000');
  await page.fill('#ot-weekday', '20');
  await page.fill('#ot-weekend', '16');
  await page.fill('#ot-holiday', '8');
  await page.click('#tab-overtime .btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}\\02-overtime.png` });
  const otText = await page.textContent('#ot-result');
  check('结果显示', otText.includes('加班费'));
  check('金额显示', otText.includes('¥7,414'));
  check('工作日明细', otText.includes('工作日延长'));
  check('休息日明细', otText.includes('休息日'));
  check('节假日明细', otText.includes('法定节假日'));
  console.log('   💰 结果:', (await page.textContent('#ot-result .amount')).trim());

  // 3. 离职补偿
  console.log('\n3️⃣ 离职补偿计算器');
  await page.click('text=👋 离职补偿');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}\\03-severance-input.png` });
  check('表单显示', await page.isVisible('#sv-salary'));

  await page.fill('#sv-salary', '20000');
  await page.fill('#sv-years', '5');
  await page.selectOption('#sv-reason', 'illegal');
  await page.click('#tab-severance .btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}\\04-severance-result.png` });
  const svText = await page.textContent('#sv-result');
  check('2N结果显示', svText.includes('2N'));
  check('金额显示', svText.includes('¥200,000'));
  check('法律依据', svText.includes('劳动合同法'));
  console.log('   💰 结果:', (await page.textContent('#sv-result .amount')).trim());

  // 4. 未提前通知 +1
  console.log('\n4️⃣ 测试代通知金+1');
  await page.selectOption('#sv-reason', 'dismissal');
  await page.uncheck('#sv-notice');
  await page.click('#tab-severance .btn');
  await page.waitForTimeout(500);
  const svText2 = await page.textContent('#sv-result');
  check('+1代通知金', svText2.includes('代通知金'));
  check('经济补偿N', svText2.includes('经济补偿金'));
  console.log('   💰 结果:', (await page.textContent('#sv-result .amount')).trim());

  // 5. 未签合同
  console.log('\n5️⃣ 测试未签合同双倍工资');
  await page.uncheck('#sv-contract');
  await page.fill('#sv-years', '1');
  await page.selectOption('#sv-reason', 'dismissal');
  await page.check('#sv-notice');
  await page.click('#tab-severance .btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}\\05-no-contract.png` });
  const svText3 = await page.textContent('#sv-result');
  check('双倍工资', svText3.includes('双倍工资'));
  console.log('   💰 结果:', (await page.textContent('#sv-result .amount')).trim());

  // 6. 社保公积金 - 北京
  console.log('\n6️⃣ 社保公积金 - 北京');
  await page.click('text=🏥 社保公积金');
  await page.waitForTimeout(300);
  await page.fill('#si-salary', '25000');
  await page.selectOption('#si-region', 'beijing');
  await page.click('#tab-insurance .btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}\\06-insurance-bj.png` });
  const bjText = await page.textContent('#si-result');
  check('北京显示', bjText.includes('北京'));
  check('明细表格', bjText.includes('养老保险') && bjText.includes('住房公积金'));
  console.log('   💰 结果:', (await page.textContent('#si-result .amount')).trim());

  // 7. 社保公积金 - 郑州
  console.log('\n7️⃣ 社保公积金 - 郑州');
  await page.selectOption('#si-region', 'zhengzhou');
  await page.click('#tab-insurance .btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}\\07-insurance-zz.png` });
  const zzText = await page.textContent('#si-result');
  check('郑州显示', zzText.includes('郑州'));
  console.log('   💰 结果:', (await page.textContent('#si-result .amount')).trim());

  // 8. 桌面端
  console.log('\n8️⃣ 桌面端适配');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('https://liang80443.github.io/suanzhang/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: `${dir}\\08-desktop.png`, fullPage: true });
  check('桌面端正常加载', await page.isVisible('h1'));

  // 总结
  console.log('\n=====================================');
  console.log(`📊 ${passed} 通过 | ${failed} 失败 | 共 ${passed + failed} 项`);
  console.log(failed === 0 ? '🎉 全部通过！' : '⚠️ 有失败项需要修复');
  console.log('📸 截图: suanzhang/test/');
  console.log('=====================================');

  await browser.close();
})();
