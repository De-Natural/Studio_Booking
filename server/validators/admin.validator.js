const { body } = require('express-validator');

const blockDateValidator = [
  body('date').isISO8601().withMessage('Valid date is required'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { blockDateValidator, loginValidator };
