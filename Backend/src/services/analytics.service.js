const analyticsRepo = require('../repositories/analytics.repository');

async function districtTotals(filters) {
  return analyticsRepo.totalsByDistrict(filters);
}

async function categoryTotals(filters) {
  return analyticsRepo.totalsByCategory(filters);
}

module.exports = { districtTotals, categoryTotals };
