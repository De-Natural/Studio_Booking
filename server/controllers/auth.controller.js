const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendError } = require('../utils/response');

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// @desc    User/Admin login
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Check if admin credentials (env-based)
  if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
    const token = generateToken({ email, role: 'ADMIN', name: 'Admin' });
    return sendResponse(res, 200, 'Login successful', {
      token,
      user: { email, role: 'ADMIN', name: 'Admin' },
    });
  }

  // 2. Check DB for user
  const user = await User.findOne({ email });
  if (!user) {
    return sendError(res, 401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 401, 'Invalid email or password');
  }

  if (!user.emailVerified) {
    return sendError(res, 403, 'Please verify your email before signing in.');
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return sendResponse(res, 200, 'Login successful', {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

// @desc    User signup
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    if (existingUser.emailVerified) {
      return sendError(res, 409, 'An account with this email already exists.');
    }
    
    // User exists but is NOT verified - allow them to "re-register"
    console.log('DEBUG: User exists but unverified. Updating and resending code.');
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    existingUser.name = name;
    existingUser.passwordHash = password; // Will be hashed by pre-save
    existingUser.verificationCode = verificationCode;
    existingUser.verificationExpires = verificationExpires;
    await existingUser.save();

    try {
      const { sendVerificationEmail } = require('../utils/mailer');
      await sendVerificationEmail(existingUser.email, verificationCode);
    } catch (err) {
      console.error('Failed to resend verification email:', err);
    }

    return sendResponse(res, 201, 'Account already exists but was unverified. A new code has been sent.', {
      user: { id: existingUser._id, email: existingUser.email, name: existingUser.name }
    });
  }

  // Generate verification code (6 digits)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: 'USER',
    emailVerified: false,
    verificationCode,
    verificationExpires,
  });

  // Send verification email
  try {
    const { sendVerificationEmail } = require('../utils/mailer');
    await sendVerificationEmail(user.email, verificationCode);
  } catch (err) {
    console.error('Failed to send verification email:', err);
  }

  return sendResponse(res, 201, 'Account created successfully. Please check your email for verification code.', {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
  });
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return sendError(res, 400, 'Email and code are required');
  }

  const user = await User.findOne({
    email,
    verificationCode: code,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return sendError(res, 400, 'Invalid or expired verification code');
  }

  user.emailVerified = true;
  user.verificationCode = undefined;
  user.verificationExpires = undefined;
  await user.save();

  return sendResponse(res, 200, 'Email verified successfully. You can now login.');
});

// @desc    Verify JWT token (check if user is still authenticated)
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = asyncHandler(async (req, res) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authenticated');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return sendResponse(res, 200, 'Token valid', { user: decoded });
  } catch {
    return sendError(res, 401, 'Token expired or invalid');
  }
});

// @desc    Resend verification code
// @route   POST /api/auth/resend-code
// @access  Public
const resendCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return sendError(res, 404, 'No account found with this email.');
  }

  if (user.emailVerified) {
    return sendError(res, 400, 'This account is already verified. Please login.');
  }

  // Generate new verification code (6 digits)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.verificationCode = verificationCode;
  user.verificationExpires = verificationExpires;
  await user.save();

  // Send verification email
  try {
    const { sendVerificationEmail } = require('../utils/mailer');
    await sendVerificationEmail(user.email, verificationCode);
  } catch (err) {
    console.error('Failed to resend verification email:', err);
    return sendError(res, 500, 'Failed to send email. Please try again later.');
  }

  return sendResponse(res, 200, 'A new verification code has been sent to your email.');
});

module.exports = { login, signup, verifyEmail, verifyToken, resendCode };
