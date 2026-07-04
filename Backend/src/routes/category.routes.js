const { Router } = require('express');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = Router();

const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.listCategories);
router.post('/', protect, requireRole('ADMIN'), (req, res) => res.status(501).json({ message: 'Not implemented' }));

module.exports = router;
