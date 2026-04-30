/**
 * Standardized API Response Helper
 */
const sendResponse = (res, statusCode, message, data = {}, success = true) => {
  return res.status(statusCode).json({
    success,
    message,
    data,    
  });
};

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: message, // Some frontends expect "error" key
  });
};

module.exports = { sendResponse, sendError };
