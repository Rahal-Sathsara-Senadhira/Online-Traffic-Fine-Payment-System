const { Payment, Fine } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function createPayment({ fineId, amount, paymentMethod, transactionReference }, options = {}) {
  const id = uuidv4();
  const payment = await Payment.create({
    id,
    fine_id: fineId,
    amount,
    payment_method: paymentMethod,
    transaction_reference: transactionReference,
    paid_at: new Date(),
  }, options);

  await Fine.update(
    { status: 'PAID' },
    { where: { id: fineId }, transaction: options.transaction }
  );

  return payment.get({ plain: true });
}

async function findById(id) {
  const p = await Payment.findByPk(id, {
    include: [
      { model: Fine, as: 'fine', attributes: ['id', 'reference_number', 'driver_name', 'vehicle_number'] },
    ],
  });
  return p ? p.get({ plain: true }) : null;
}

async function findByFineId(fineId) {
  const p = await Payment.findOne({ where: { fine_id: fineId } });
  return p ? p.get({ plain: true }) : null;
}

module.exports = { createPayment, findById, findByFineId }; 
