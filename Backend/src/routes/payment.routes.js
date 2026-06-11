const { Router } = require('express');
const { body }   = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { validate }      = require('../middleware/validate.middleware');

const router = Router();

const paymentRules = [
  body('referenceNumber').notEmpty().withMessage('referenceNumber is required'),
  body('categoryId').notEmpty().withMessage('categoryId is required'),
  body('paymentMethod').isIn(['CARD', 'ONLINE_BANKING']).withMessage('paymentMethod must be CARD or ONLINE_BANKING'),
];

router.post('/', paymentRules, validate, paymentController.processPayment);
router.get('/:id', paymentController.getReceipt);

module.exports = router;
