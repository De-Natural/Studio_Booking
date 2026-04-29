const express = require('express');
const { login, signup, verifyEmail, verifyToken } = require('../controllers/auth.controller');
const { loginValidator } = require('../validators/admin.validator');
const validate = require('../middleware/validate.middleware');
const { body } = require('express-validator');

const router = express.Router();

// Login (admin or user)
router.post('/login', loginValidator, validate, login);

// Verify email
router.post('/verify-email', verifyEmail);

// Resend verification code
router.post('/resend-code', [body('email').isEmail()], validate, require('../controllers/auth.controller').resendCode);

// Signup
router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  signup
);

// Verify token
router.get('/verify', verifyToken);

module.exports = router;
