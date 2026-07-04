const { Officer } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const listOfficers = asyncHandler(async (req, res) => {
  const officers = await Officer.findAll({ order: [['full_name', 'ASC']] });
  res.json(officers);
});

module.exports = { listOfficers };
