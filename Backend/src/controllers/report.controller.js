const analyticsService = require('../services/analytics.service');
const ApiError = require('../utils/ApiError');

async function districtTotals(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const filters = { startDate, endDate };
    const totals = await analyticsService.districtTotals(filters);
    res.json({ data: totals });
  } catch (err) {
    next(err);
  }
}

async function categoryTotals(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const filters = { startDate, endDate };
    const totals = await analyticsService.categoryTotals(filters);
    res.json({ data: totals });
  } catch (err) {
    next(err);
  }
}

async function summary(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const filters = { startDate, endDate };
    const [districts, categories] = await Promise.all([
      analyticsService.districtTotals(filters),
      analyticsService.categoryTotals(filters),
    ]);
    res.json({ data: { districts, categories } });
  } catch (err) {
    next(err);
  }
}

module.exports = { districtTotals, categoryTotals, summary };
