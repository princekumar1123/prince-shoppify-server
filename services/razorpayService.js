const Razorpay = require("razorpay");
const crypto = require("crypto");

// Validate env vars on startup
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env");
}

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in rupees (will be converted to paise)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt ID (max 40 chars)
 * @returns {Promise<object>} Razorpay order object
 */
const createOrder = async (amount, currency = "INR", receipt) => {
    // Razorpay receipt max length is 40 chars
    const safeReceipt = receipt.slice(0, 40);
    const options = {
        amount: Math.round(amount) * 100, // Convert rupees to paise, must be integer
        currency,
        receipt: safeReceipt,
        payment_capture: 1, // Auto-capture payment
    };
    return await razorpayInstance.orders.create(options);
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");
    return expectedSignature === signature;
};

module.exports = { createOrder, verifyPaymentSignature, razorpayInstance };
