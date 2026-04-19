const { calculateOvertime } = require('./calculators/overtime');
const { calculateSeverance } = require('./calculators/severance');
const { calculateSocialInsurance, getSupportedRegions } = require('./calculators/social-insurance');

module.exports = {
  calculateOvertime,
  calculateSeverance,
  calculateSocialInsurance,
  getSupportedRegions
};
