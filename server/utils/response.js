/**
 * Standardized API Response Helper
 */
const sendResponse = (res, statusCode, message, data = {}, success = true) => {
  // We include root level data for compatibility with existing frontend
  // and the requested "data" wrapper for the new standard.
  return res.status(statusCode).json({
    success,
    message,
    ...data, // Root level keys for frontend compatibility (e.g. data.booking)
    data,    // Standardized data wrapper
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
