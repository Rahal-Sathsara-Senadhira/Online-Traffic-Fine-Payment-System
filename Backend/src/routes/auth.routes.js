const { Router } = require('express');
const { body }   = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect }    = require('../middleware/auth.middleware');
const { requireRole} = require('../middleware/role.middleware');
const { validate }   = require('../middleware/validate.middleware');

const router = Router();

const loginRules = [
  body('username').notEmpty().withMessage('username is required'),
  body('password').notEmpty().withMessage('password is required'),
];

const registerRules = [
  body('username').notEmpty().isLength({ min: 3 }).withMessage('username must be at least 3 characters'),
  body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
];

router.post('/login',    loginRules,    validate, authController.login);
router.post('/register', registerRules, validate, protect, requireRole('ADMIN'), authController.register);

module.exports = router;
