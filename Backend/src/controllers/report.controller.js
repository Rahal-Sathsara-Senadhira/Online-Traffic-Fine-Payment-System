const analyticsService = require('../services/analytics.service');
const asyncHandler = require('../utils/asyncHandler');

const districtTotals = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filters = { startDate, endDate };
  const totals = await analyticsService.districtTotals(filters);
  res.json({ data: totals });
});

const categoryTotals = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filters = { startDate, endDate };
  const totals = await analyticsService.categoryTotals(filters);
  res.json({ data: totals });
});

const summary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filters = { startDate, endDate };
  const [districts, categories] = await Promise.all([
    analyticsService.districtTotals(filters),
    analyticsService.categoryTotals(filters),
  ]);
  res.json({ data: { districts, categories } });
});

module.exports = { districtTotals, categoryTotals, summary };
