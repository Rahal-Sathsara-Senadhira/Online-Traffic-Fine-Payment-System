const { Router } = require('express');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = Router();

const officerController = require('../controllers/officer.controller');

router.get('/',    protect, requireRole('ADMIN', 'OFFICER'), officerController.listOfficers);
router.post('/',   protect, requireRole('ADMIN'), (req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/:id', protect, requireRole('ADMIN'), (req, res) => res.status(501).json({ message: 'Not implemented' }));

module.exports = router;
