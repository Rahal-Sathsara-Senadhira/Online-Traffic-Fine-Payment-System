const { Router } = require('express');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = Router();

// TODO: implement ReportController
router.get('/summary',    protect, requireRole('ADMIN'), (req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/districts',  protect, requireRole('ADMIN'), (req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/categories', protect, requireRole('ADMIN'), (req, res) => res.status(501).json({ message: 'Not implemented' }));

module.exports = router;
