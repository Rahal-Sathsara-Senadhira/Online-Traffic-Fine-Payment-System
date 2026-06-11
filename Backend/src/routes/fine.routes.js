const { Router } = require('express');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = Router();

// TODO: implement FineController
router.get('/:referenceNumber', (req, res) => res.status(501).json({ message: 'Not implemented' }));
router.post('/',   protect, requireRole('ADMIN'), (req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/',    protect, requireRole('ADMIN'), (req, res) => res.status(501).json({ message: 'Not implemented' }));

module.exports = router;
