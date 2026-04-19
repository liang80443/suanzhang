import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateOvertime, calculateSeverance, calculateSocialInsurance } from '../src/index.js';

describe('加班费计算器', () => {
  it('月薪10000，工作日加班10小时', () => {
    const r = calculateOvertime({ monthlySalary: 10000, weekdayHours: 10 });
    // 时薪 = 10000 / 21.75 / 8 = 57.47
    // 10h × 57.47 × 1.5 = 862
    assert.ok(r.summary.total >= 860 && r.summary.total <= 870);
    assert.equal(r.summary.details.length, 1);
  });

  it('三种加班都有', () => {
    const r = calculateOvertime({ monthlySalary: 10000, weekdayHours: 8, weekendHours: 8, holidayHours: 4 });
    assert.equal(r.summary.details.length, 3);
    assert.ok(r.summary.total > 0);
  });

  it('没有加班返回0', () => {
    const r = calculateOvertime({ monthlySalary: 10000 });
    assert.equal(r.summary.total, 0);
    assert.equal(r.summary.details.length, 0);
  });
});

describe('离职补偿计算器', () => {
  it('公司辞退，3.5年', () => {
    const r = calculateSeverance({ monthlySalary: 15000, years: 3.5, reason: 'dismissal' });
    // 3.5年 → 4年，N = 4 × 15000 = 60000
    assert.ok(r.summary.claims.length >= 1);
    const n = r.summary.claims.find(c => c.type.includes('经济补偿金'));
    assert.ok(n);
    assert.equal(n.amount, 60000);
  });

  it('违法解除 2N', () => {
    const r = calculateSeverance({ monthlySalary: 15000, years: 3.5, reason: 'illegal' });
    const n2 = r.summary.claims.find(c => c.type.includes('2N'));
    assert.ok(n2);
    assert.equal(n2.amount, 120000);
  });

  it('未签合同双倍工资', () => {
    // 2年工龄未签合同，可主张 min(11, floor(2)) = 2个月双倍工资
    const r = calculateSeverance({ monthlySalary: 10000, years: 2, reason: 'dismissal', hasWrittenContract: false });
    const contract = r.summary.claims.find(c => c.type.includes('双倍'));
    assert.ok(contract);
    assert.equal(contract.amount, 20000);
  });

  it('主动辞职没有N', () => {
    const r = calculateSeverance({ monthlySalary: 15000, years: 3, reason: 'resign' });
    const n = r.summary.claims.find(c => c.type.includes('经济补偿金'));
    assert.ok(!n);
  });

  it('未提前通知有+1', () => {
    const r = calculateSeverance({ monthlySalary: 15000, years: 3, reason: 'dismissal', hasAdvanceNotice: false });
    const plus1 = r.summary.claims.find(c => c.type.includes('代通知金'));
    assert.ok(plus1);
    assert.equal(plus1.amount, 15000);
  });
});

describe('社保公积金计算器', () => {
  it('郑州，月薪10000', () => {
    const r = calculateSocialInsurance({ monthlySalary: 10000, region: 'zhengzhou' });
    assert.ok(r.summary.totalPersonal > 0);
    assert.ok(r.summary.totalCompany > 0);
    assert.equal(r.params.region, '郑州');
  });

  it('不支持的城市返回错误', () => {
    const r = calculateSocialInsurance({ monthlySalary: 10000, region: 'mars' });
    assert.ok(r.error);
    assert.ok(r.supportedRegions);
  });

  it('所有支持的城市都能计算', () => {
    const regions = ['beijing', 'shanghai', 'shenzhen', 'guangzhou', 'zhengzhou', 'hangzhou'];
    for (const region of regions) {
      const r = calculateSocialInsurance({ monthlySalary: 10000, region });
      assert.ok(!r.error, `Failed for ${region}`);
    }
  });
});
