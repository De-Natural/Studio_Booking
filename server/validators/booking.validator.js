const { body } = require('express-validator');

const createBookingValidator = [
  body('name').if(body('clientName').not().exists()).notEmpty().withMessage('Name is required'),
  body('clientName').if(body('name').not().exists()).notEmpty().withMessage('Name is required'),
  body('email').if(body('clientEmail').not().exists()).isEmail().withMessage('Valid email is required'),
  body('clientEmail').if(body('email').not().exists()).isEmail().withMessage('Valid email is required'),
  body('phone').if(body('clientPhone').not().exists()).notEmpty().withMessage('Phone number is required'),
  body('clientPhone').if(body('phone').not().exists()).notEmpty().withMessage('Phone number is required'),
  body('date').if(body('bookingDate').not().exists()).isISO8601().withMessage('Valid date is required'),
  body('bookingDate').if(body('date').not().exists()).isISO8601().withMessage('Valid date is required'),
  body('timeSlot').if(body('timeSlotId').not().exists()).notEmpty().withMessage('Time slot is required'),
  body('timeSlotId').if(body('timeSlot').not().exists()).notEmpty().withMessage('Time slot is required'),
];

module.exports = { createBookingValidator };
