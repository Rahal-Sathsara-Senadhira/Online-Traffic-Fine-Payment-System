const paymentService = require('../services/payment.service');
const asyncHandler   = require('../utils/asyncHandler');

const processPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.processPayment(req.body);
  res.status(201).json(result);
});

const getReceipt = asyncHandler(async (req, res) => {
  const receipt = await paymentService.getReceipt(req.params.id);
  res.json(receipt);
});

module.exports = { processPayment, getReceipt };
