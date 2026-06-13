const { Router } = require('express');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const reportController = require('../controllers/report.controller');

const router = Router();

router.get('/summary',    protect, requireRole('ADMIN'), reportController.summary);
router.get('/districts',  protect, requireRole('ADMIN'), reportController.districtTotals);
router.get('/categories', protect, requireRole('ADMIN'), reportController.categoryTotals);

module.exports = router;
