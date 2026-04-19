// 离职补偿计算器
// 法律依据：《劳动合同法》第46、47、48、82、87条

function calculateSeverance({ monthlySalary, years, reason, hasWrittenContract = true, hasSocialInsurance = true, hasAdvanceNotice = true, region }) {
  const claims = [];
  const roundedYears = years % 1 === 0 ? years : (years % 1 >= 0.5 ? Math.ceil(years) : Math.floor(years) + 0.5);

  const AVG_SALARY_LIMITS = {
    beijing: 25290, shanghai: 36549, shenzhen: 27501,
    guangzhou: 28134, zhengzhou: 21370, hangzhou: 28368
  };
  const regionKey = region || 'zhengzhou';
  const salaryLimit = AVG_SALARY_LIMITS[regionKey] || 30000;
  const cappedSalary = Math.min(monthlySalary, salaryLimit);
  const salaryIsCapped = monthlySalary > salaryLimit;

  if (['dismissal', 'mutual', 'expire'].includes(reason)) {
    const n = roundedYears;
    const amount = Math.round(cappedSalary * n);
    claims.push({
      type: '经济补偿金（N）',
      formula: `N = ${n} 个月 × 月薪 ¥${monthlySalary.toLocaleString()}` + (salaryIsCapped ? `（封顶 ¥${cappedSalary.toLocaleString()}）` : ''),
      months: n,
      amount,
      legalBasis: '《劳动合同法》第46条、第47条',
      note: '工作年限不满6个月按0.5年，满6个月按1年计算'
    });
  }

  if ((reason === 'dismissal' || reason === 'mutual') && !hasAdvanceNotice) {
    const amount = monthlySalary;
    claims.push({
      type: '代通知金（+1）',
      formula: `1 个月 × 月薪 ¥${monthlySalary.toLocaleString()}`,
      months: 1,
      amount,
      legalBasis: '《劳动合同法》第40条',
      note: '仅限公司因能力/客观原因解除且未提前30天书面通知的情况'
    });
  }

  if (reason === 'illegal') {
    const n = roundedYears;
    const amount = Math.round(cappedSalary * n * 2);
    claims.push({
      type: '违法解除赔偿金（2N）',
      formula: `2N = ${n} 年 × 2 × 月薪 ¥${monthlySalary.toLocaleString()}` + (salaryIsCapped ? `（封顶 ¥${cappedSalary.toLocaleString()}）` : ''),
      months: n * 2,
      amount,
      legalBasis: '《劳动合同法》第87条',
      note: '2N 和 N 不能同时主张，择一较高者'
    });
  }

  if (!hasWrittenContract) {
    const months = Math.min(11, Math.floor(years));
    if (months > 0) {
      const amount = monthlySalary * months;
      claims.push({
        type: '未签合同双倍工资',
        formula: `${months} 个月 × 月薪 ¥${monthlySalary.toLocaleString()}`,
        months,
        amount,
        legalBasis: '《劳动合同法》第82条',
        note: '最多支持11个月（入职第2-12个月），有1年仲裁时效'
      });
    }
  }

  if (!hasSocialInsurance) {
    claims.push({
      type: '社保补缴',
      formula: '需向社保局申请补缴',
      amount: null,
      legalBasis: '《社会保险法》第58条、第60条',
      note: '无法直接折算为金额，需向社保局投诉要求补缴（无时效限制）'
    });
  }

  const total = claims.filter(c => c.amount !== null).reduce((sum, c) => sum + c.amount, 0);

  return {
    params: { monthlySalary, years: roundedYears, reason },
    summary: { total, claims },
    tips: [
      '月薪基数以解除前12个月平均工资为准，含奖金、津贴',
      '月薪上限为当地社平工资的3倍（高薪人士适用）',
      '协商解除的N倍数可协商，法律只规定了下限',
      '主动辞职一般没有经济补偿金（除非公司有过错）',
      '劳动仲裁时效为1年，从知道权利被侵害之日起算',
      '未签合同的双倍工资有时效限制，逾期可能无法主张'
    ]
  };
}

export { calculateSeverance };
