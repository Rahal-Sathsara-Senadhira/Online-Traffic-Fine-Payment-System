const { Router } = require('express');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = Router();

const FineController = require('../controllers/fine.controller');

router.get('/:referenceNumber', FineController.getByReference);
router.post('/',   protect, requireRole('ADMIN'), FineController.createFine);
router.get('/',    protect, requireRole('ADMIN'), FineController.listFines);

module.exports = router;
