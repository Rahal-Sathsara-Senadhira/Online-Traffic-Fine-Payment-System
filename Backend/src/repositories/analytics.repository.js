const { Fine, Officer, FineCategory, Payment } = require('../models');
const { Sequelize } = require('../config/sequelize');
const { Op } = require('sequelize');

async function totalsByDistrict({ startDate, endDate } = {}) {
  const where = {};
  if (startDate || endDate) where.issued_at = {};
  if (startDate) where.issued_at[Op.gte] = startDate;
  if (endDate) where.issued_at[Op.lte] = endDate;

  const rows = await Fine.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('Fine.amount')), 'total'],
      [Sequelize.col('officer.district'), 'district'],
    ],
    include: [{ model: Officer, as: 'officer', attributes: [] }],
    where,
    group: ['officer.district'],
  });

  return rows.map(r => r.get({ plain: true }));
}

async function totalsByCategory({ startDate, endDate } = {}) {
  const where = {};
  if (startDate || endDate) where.issued_at = {};
  if (startDate) where.issued_at[Op.gte] = startDate;
  if (endDate) where.issued_at[Op.lte] = endDate;

  const rows = await Fine.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('Fine.amount')), 'total'],
      [Sequelize.col('category.name'), 'category_name'],
    ],
    include: [{ model: FineCategory, as: 'category', attributes: [] }],
    where,
    group: ['category.id', 'category.name'],
  });

  return rows.map(r => r.get({ plain: true }));
}

module.exports = { totalsByDistrict, totalsByCategory };
