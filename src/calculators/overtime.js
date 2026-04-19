// 加班费计算器
// 法律依据：《劳动法》第四十四条

/**
 * 计算加班费
 * @param {Object} params
 * @param {number} params.monthlySalary - 月薪基数（元）
 * @param {number} [params.weekdayHours=0] - 工作日延长加班时长（小时）
 * @param {number} [params.weekendHours=0] - 休息日加班时长（小时）
 * @param {number} [params.holidayHours=0] - 法定节假日加班时长（小时）
 * @param {string} [params.region] - 地区（用于未来扩展地区差异）
 * @returns {Object} 计算结果
 */
function calculateOvertime({ monthlySalary, weekdayHours = 0, weekendHours = 0, holidayHours = 0, region }) {
  // 时薪 = 月薪 ÷ 21.75天 ÷ 8小时
  // 21.75天为月计薪天数（劳动法规定）
  const dailySalary = monthlySalary / 21.75;
  const hourlySalary = dailySalary / 8;

  const details = [];

  if (weekdayHours > 0) {
    const amount = Math.round(hourlySalary * weekdayHours * 1.5);
    details.push({
      type: '工作日延长',
      hours: weekdayHours,
      rate: 150,
      description: '不低于本人小时工资的150%',
      amount
    });
  }

  if (weekendHours > 0) {
    const amount = Math.round(hourlySalary * weekendHours * 2);
    details.push({
      type: '休息日',
      hours: weekendHours,
      rate: 200,
      description: '不低于本人小时工资的200%（可安排补休替代）',
      amount
    });
  }

  if (holidayHours > 0) {
    const amount = Math.round(hourlySalary * holidayHours * 3);
    details.push({
      type: '法定节假日',
      hours: holidayHours,
      rate: 300,
      description: '不低于本人小时工资的300%（不能用补休替代）',
      amount
    });
  }

  const total = details.reduce((sum, d) => sum + d.amount, 0);

  return {
    params: {
      monthlySalary,
      hourlySalary: Math.round(hourlySalary * 100) / 100,
      dailySalary: Math.round(dailySalary * 100) / 100,
      monthlyDays: 21.75
    },
    summary: { total, details },
    tips: [
      '月计薪天数为 21.75 天（劳动法规定）',
      '时薪 = 月薪 ÷ 21.75 ÷ 8',
      '休息日加班可安排补休，不补休的需支付 200% 加班费',
      '法定节假日加班必须支付 300%，不能用补休替代',
      '加班费计算基数为税前工资，不含加班费本身'
    ]
  };
}

module.exports = { calculateOvertime };
