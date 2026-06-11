const { v4: uuidv4 } = require('uuid');
const fineRepo    = require('../repositories/fine.repository');
const paymentRepo = require('../repositories/payment.repository');
const smsService  = require('./sms.service');
const ApiError    = require('../utils/ApiError');

async function processPayment({ referenceNumber, categoryId, paymentMethod }) {
  const fine = await fineRepo.findByReferenceNumber(referenceNumber);
  if (!fine) throw new ApiError(404, 'FINE_NOT_FOUND', `Fine '${referenceNumber}' not found`);

  if (fine.category_id !== categoryId) {
    throw new ApiError(422, 'CATEGORY_MISMATCH', 'Category ID does not match this fine');
  }

  if (fine.status === 'PAID') {
    throw new ApiError(409, 'FINE_ALREADY_PAID', 'This fine has already been paid');
  }

  const transactionReference = `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const payment = await paymentRepo.create({
    id: uuidv4(),
    fineId: fine.id,
    amount: fine.amount,
    paymentMethod,
    transactionReference,
  });

  await fineRepo.updateStatus(fine.id, 'PAID');

  // Fire-and-forget — client gets response immediately
  smsService.sendPaymentConfirmation(fine).catch((err) =>
    console.error('SMS notification failed:', err.message)
  );

  return {
    paymentId: payment.id,
    referenceNumber: fine.reference_number,
    amount: fine.amount,
    transactionReference,
    paidAt: payment.paid_at,
    message: 'Payment successful. SMS notification sent to officer.',
  };
}

async function getReceipt(id) {
  const payment = await paymentRepo.findById(id);
  if (!payment) throw new ApiError(404, 'PAYMENT_NOT_FOUND', `Payment '${id}' not found`);
  return payment;
}

module.exports = { processPayment, getReceipt };
