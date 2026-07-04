const { FineCategory } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const categories = await FineCategory.findAll({ order: [['name', 'ASC']] });
  res.json(categories);
});

module.exports = { listCategories };
