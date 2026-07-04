const { Router } = require('express');
const { param, body } = require('express-validator');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate }    = require('../middleware/validate.middleware');
const FineController = require('../controllers/fine.controller');

const router = Router();

const createFineRules = [
  body('categoryId').notEmpty().withMessage('categoryId is required'),
  body('officerId').notEmpty().withMessage('officerId is required'),
  body('driverNic').notEmpty().withMessage('driverNic is required'),
  body('amount').isFloat({ min: 0 }).withMessage('amount must be a positive number'),
  body('driverName').optional().isString(),
  body('vehicleNumber').optional().isString(),
  body('location').optional().isString(),
];

router.get('/:referenceNumber', param('referenceNumber').notEmpty().withMessage('referenceNumber is required'), validate, FineController.getByReference);
router.post('/',   protect, requireRole('ADMIN', 'OFFICER'), createFineRules, validate, FineController.createFine);
router.get('/',    protect, requireRole('ADMIN'), FineController.listFines);

module.exports = router;

