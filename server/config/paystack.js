const https = require('https');
const env = require('./env');

/**
 * Paystack API helper — uses raw Node.js https module (no extra dependencies).
 * All amounts are in **kobo** (100 kobo = ₦1).
 */

const PAYSTACK_BASE = 'api.paystack.co';

function paystackRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PAYSTACK_BASE,
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(new Error('Failed to parse Paystack response'));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Initialize a transaction
 * @param {Object} params - { email, amount (kobo), reference, callback_url, metadata }
 * @returns {Promise<Object>} Paystack response with authorization_url
 */
async function initializeTransaction(params) {
  return paystackRequest('POST', '/transaction/initialize', params);
}

/**
 * Verify a transaction by reference
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Paystack response with transaction details
 */
async function verifyTransaction(reference) {
  return paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
}

/**
 * Create a refund for a transaction
 * @param {Object} params - { transaction (reference or id), amount (optional, kobo) }
 * @returns {Promise<Object>} Paystack refund response
 */
async function createRefund(params) {
  return paystackRequest('POST', '/refund', params);
}

module.exports = {
  initializeTransaction,
  verifyTransaction,
  createRefund,
};
