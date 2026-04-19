// 离职补偿计算器
// 法律依据：《劳动合同法》第46、47、48、82、87条

/**
 * 计算离职补偿
 * @param {Object} params
 * @param {number} params.monthlySalary - 月薪基数（元）
 * @param {number} params.years - 工作年限（支持小数，如 3.5 = 3年6个月）
 * @param {string} params.reason - 离职原因：dismissal(公司辞退) | mutual(协商解除) | illegal(违法解除) | expire(合同到期不续签) | resign(主动辞职)
 * @param {boolean} [params.hasWrittenContract=true] - 是否有书面劳动合同
 * @param {boolean} [params.hasSocialInsurance=true] - 是否缴纳社保
 * @param {boolean} [params.hasAdvanceNotice=true] - 公司是否提前30天通知
 * @param {string} [params.region] - 地区（用于计算社平工资3倍上限）
 * @returns {Object} 计算结果
 */
function calculateSeverance({ monthlySalary, years, reason, hasWrittenContract = true, hasSocialInsurance = true, hasAdvanceNotice = true, region }) {
  const claims = [];

  // 工作年限计算规则：不满6个月=0.5年，满6个月不满1年=1年
  const roundedYears = years % 1 === 0 ? years : (years % 1 >= 0.5 ? Math.ceil(years) : Math.floor(years) + 0.5);

  // === 经济补偿金 N ===
  // 适用条件：公司辞退、协商解除、合同到期公司不续签、经济性裁员
  if (['dismissal', 'mutual', 'expire'].includes(reason)) {
    const n = roundedYears;
    const amount = Math.round(monthlySalary * n);
    claims.push({
      type: '经济补偿金（N）',
      formula: `N = ${n} 个月 × 月薪 ¥${monthlySalary.toLocaleString()}`,
      months: n,
      amount,
      legalBasis: '《劳动合同法》第46条、第47条',
      note: '工作年限不满6个月按0.5年，满6个月按1年计算'
    });
  }

  // === 代通知金 +1 ===
  // 适用条件：公司无过错性辞退（第40条），未提前30天通知
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

  // === 违法解除赔偿金 2N ===
  // 适用条件：公司违法解除劳动合同
  if (reason === 'illegal') {
    const n = roundedYears;
    const amount = Math.round(monthlySalary * n * 2);
    claims.push({
      type: '违法解除赔偿金（2N）',
      formula: `2N = ${n} 年 × 2 × 月薪 ¥${monthlySalary.toLocaleString()}`,
      months: n * 2,
      amount,
      legalBasis: '《劳动合同法》第87条',
      note: '2N 和 N 不能同时主张，择一较高者'
    });
  }

  // === 未签书面合同双倍工资 ===
  if (!hasWrittenContract) {
    // 最多支持11个月（入职第2个月到第12个月）
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

  // === 未缴社保 ===
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

module.exports = { calculateSeverance };
