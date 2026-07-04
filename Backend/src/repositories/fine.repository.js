const { Fine, FineCategory, Officer, Payment } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function findByReferenceNumber(referenceNumber) {
  const fine = await Fine.findOne({
    where: { reference_number: referenceNumber },
    include: [
      { model: FineCategory, as: 'category', attributes: ['id', 'name'] },
      { model: Officer, as: 'officer', attributes: ['id', 'full_name', 'phone', 'badge_number', 'district'] },
      { model: Payment, as: 'payment', attributes: ['id', 'amount', 'transaction_reference', 'paid_at'] },
    ],
  });
  return fine ? fine.get({ plain: true }) : null;
}

async function findAll({ status } = {}) {
  const where = status ? { status } : undefined;
  const fines = await Fine.findAll({
    where,
    include: [
      { model: FineCategory, as: 'category', attributes: ['id', 'name'] },
      { model: Officer, as: 'officer', attributes: ['id', 'badge_number', 'district'] },
    ],
    order: [['issued_at', 'DESC']],
  });
  return fines.map(f => f.get({ plain: true }));
}

async function create({ categoryId, officerId, driverNic, driverName, vehicleNumber, location, amount }) {
  const id = uuidv4();
  const referenceNumber = `TF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  await Fine.create({
    id,
    reference_number: referenceNumber,
    category_id: categoryId,
    officer_id: officerId,
    driver_nic: driverNic,
    driver_name: driverName,
    vehicle_number: vehicleNumber,
    location,
    amount,
    issued_at: new Date(),
  });
  return findByReferenceNumber(referenceNumber);
}

async function updateStatus(id, status, options = {}) {
  await Fine.update({ status }, { where: { id }, ...options });
}

module.exports = { findByReferenceNumber, findAll, create, updateStatus };
