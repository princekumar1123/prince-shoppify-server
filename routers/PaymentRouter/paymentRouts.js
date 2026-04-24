const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/verifyToken");
const paymentController = require("../../controllers/PaymentController/paymentController");

// Get Razorpay key (public, no auth needed)
router.get("/razorpay-key", paymentController.getRazorpayKey);

// Create payment order (protected)
router.post("/create-order", authenticate, paymentController.createPaymentOrder);

// Verify payment and place order (protected)
router.post("/verify-payment", authenticate, paymentController.verifyPaymentAndPlaceOrder);

module.exports = router;
