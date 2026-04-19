// 社保公积金计算器
// 数据来源：各地人社局/公积金管理中心公开数据

// 各城市费率数据（社区可补充更多城市）
const REGIONS = {
  beijing: {
    name: '北京',
    pension: { personal: 8, company: 16 },
    medical: { personal: 2, company: 9.8 },
    unemployment: { personal: 0.5, company: 0.5 },
    workInjury: { personal: 0, company: 0.4 },
    maternity: { personal: 0, company: 0.8 },
    housingFund: { personal: 12, company: 12 },
    housingFundBaseRange: { min: 2420, max: 35283 }
  },
  shanghai: {
    name: '上海',
    pension: { personal: 8, company: 16 },
    medical: { personal: 2, company: 9.5 },
    unemployment: { personal: 0.5, company: 0.5 },
    workInjury: { personal: 0, company: 0.16 },
    maternity: { personal: 0, company: 1 },
    housingFund: { personal: 7, company: 7 },
    housingFundBaseRange: { min: 2690, max: 36549 }
  },
  shenzhen: {
    name: '深圳',
    pension: { personal: 8, company: 16 },
    medical: { personal: 2, company: 5.2 },
    unemployment: { personal: 0.3, company: 0.7 },
    workInjury: { personal: 0, company: 0.14 },
    maternity: { personal: 0, company: 0.45 },
    housingFund: { personal: 5, company: 5 },
    housingFundBaseRange: { min: 2360, max: 27501 }
  },
  guangzhou: {
    name: '广州',
    pension: { personal: 8, company: 16 },
    medical: { personal: 2, company: 5.5 },
    unemployment: { personal: 0.2, company: 0.8 },
    workInjury: { personal: 0, company: 0.2 },
    maternity: { personal: 0, company: 0.85 },
    housingFund: { personal: 5, company: 5 },
    housingFundBaseRange: { min: 2300, max: 38082 }
  },
  zhengzhou: {
    name: '郑州',
    pension: { personal: 8, company: 16 },
    medical: { personal: 2, company: 8 },
    unemployment: { personal: 0.3, company: 0.7 },
    workInjury: { personal: 0, company: 0.2 },
    maternity: { personal: 0, company: 1 },
    housingFund: { personal: 12, company: 12 },
    housingFundBaseRange: { min: 2100, max: 28134 }
  },
  hangzhou: {
    name: '杭州',
    pension: { personal: 8, company: 14 },
    medical: { personal: 2, company: 9.5 },
    unemployment: { personal: 0.5, company: 0.5 },
    workInjury: { personal: 0, company: 0.2 },
    maternity: { personal: 0, company: 1.2 },
    housingFund: { personal: 12, company: 12 },
    housingFundBaseRange: { min: 2490, max: 36318 }
  }
};

/**
 * 计算社保公积金
 * @param {Object} params
 * @param {number} params.monthlySalary - 月薪（元）
 * @param {string} [params.region='zhengzhou'] - 城市代码
 * @returns {Object} 计算结果
 */
function calculateSocialInsurance({ monthlySalary, region = 'zhengzhou' }) {
  const city = REGIONS[region];

  if (!city) {
    return {
      error: `暂不支持该城市，当前支持：${Object.values(REGIONS).map(r => r.name).join('、')}。欢迎提交 PR 添加你的城市！`,
      supportedRegions: Object.keys(REGIONS).map(k => ({ code: k, name: REGIONS[k].name }))
    };
  }

  // 公积金基数范围调整
  const base = Math.max(
    city.housingFundBaseRange.min,
    Math.min(monthlySalary, city.housingFundBaseRange.max)
  );

  const items = [
    {
      name: '养老保险',
      personal: Math.round(monthlySalary * city.pension.personal / 100),
      company: Math.round(monthlySalary * city.pension.company / 100),
      personalRate: city.pension.personal,
      companyRate: city.pension.company
    },
    {
      name: '医疗保险',
      personal: Math.round(monthlySalary * city.medical.personal / 100),
      company: Math.round(monthlySalary * city.medical.company / 100),
      personalRate: city.medical.personal,
      companyRate: city.medical.company
    },
    {
      name: '失业保险',
      personal: Math.round(monthlySalary * city.unemployment.personal / 100),
      company: Math.round(monthlySalary * city.unemployment.company / 100),
      personalRate: city.unemployment.personal,
      companyRate: city.unemployment.company
    },
    {
      name: '工伤保险',
      personal: 0,
      company: Math.round(monthlySalary * city.workInjury.company / 100),
      personalRate: city.workInjury.personal,
      companyRate: city.workInjury.company
    },
    {
      name: '生育保险',
      personal: 0,
      company: Math.round(monthlySalary * city.maternity.company / 100),
      personalRate: city.maternity.personal,
      companyRate: city.maternity.company
    },
    {
      name: '住房公积金',
      personal: Math.round(base * city.housingFund.personal / 100),
      company: Math.round(base * city.housingFund.company / 100),
      personalRate: city.housingFund.personal,
      companyRate: city.housingFund.company,
      note: `缴纳基数 ¥${base.toLocaleString()}（范围 ¥${city.housingFundBaseRange.min}-¥${city.housingFundBaseRange.max}）`
    }
  ];

  const totalPersonal = items.reduce((s, i) => s + i.personal, 0);
  const totalCompany = items.reduce((s, i) => s + i.company, 0);

  return {
    params: { monthlySalary, region: city.name, base },
    summary: {
      items,
      totalPersonal,
      totalCompany,
      total: totalPersonal + totalCompany,
      takeHome: monthlySalary - totalPersonal  // 实际到手（粗略估算）
    },
    tips: [
      `以上为 ${city.name} 的参考费率，实际以当地最新政策为准`,
      '到手工资 = 月薪 - 个人缴纳部分（粗略估算，不含个税和专项扣除）',
      '如果发现实际缴纳与计算不符，可向社保局投诉',
      '公积金基数有上下限，超出部分不纳入计算'
    ]
  };
}

/**
 * 获取支持的城市列表
 */
function getSupportedRegions() {
  return Object.keys(REGIONS).map(k => ({ code: k, name: REGIONS[k].name }));
}

module.exports = { calculateSocialInsurance, getSupportedRegions, REGIONS };
