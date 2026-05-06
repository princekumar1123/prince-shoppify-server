const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { validate } = require("../../middleware/validate");
const { authenticate } = require("../../middleware/verifyToken");
const { verifyAdmin } = require("../../middleware/verifyAdmin");
const ctrl = require("../../controllers/UserController/userRegisterController");

// ── Auth rate limiter ─────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { status: false, message: "Too many attempts, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Validation rules ──────────────────────────────────────────────────────────
const registerRules = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("mobile").trim().matches(/^\d{10}$/).withMessage("Mobile must be 10 digits"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginRules = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

const addressRules = [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("mobile").trim().matches(/^\d{10}$/).withMessage("Mobile must be 10 digits"),
    body("pincode").trim().matches(/^\d{6}$/).withMessage("Pincode must be 6 digits"),
    body("addressLine1").trim().notEmpty().withMessage("Address line 1 is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
];

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/register", authLimiter, registerRules, validate, ctrl.createNewUser);
router.post("/login", authLimiter, loginRules, validate, ctrl.loginCredential);

// ── Profile ───────────────────────────────────────────────────────────────────
router.get("/profile", authenticate, ctrl.getProfile);
router.put("/profile", authenticate, ctrl.updateProfile);

// ── Addresses ─────────────────────────────────────────────────────────────────
router.get("/addresses", authenticate, ctrl.getAddresses);
router.post("/addresses", authenticate, addressRules, validate, ctrl.addAddress);
router.put("/addresses/:addressId", authenticate, ctrl.updateAddress);
router.delete("/addresses/:addressId", authenticate, ctrl.deleteAddress);
router.patch("/addresses/:addressId/default", authenticate, ctrl.setDefaultAddress);

// ── Cart ──────────────────────────────────────────────────────────────────────
router.get("/cart", authenticate, ctrl.getCart);
router.post("/cart", authenticate, ctrl.addToCart);
router.put("/cart/:productId", authenticate, ctrl.updateCartItem);
router.delete("/cart/:productId", authenticate, ctrl.removeFromCart);
router.delete("/cart", authenticate, ctrl.clearCart);

// ── Orders ────────────────────────────────────────────────────────────────────
router.post("/orders", authenticate, ctrl.placeOrder);
router.get("/orders", authenticate, ctrl.getOrders);
router.get("/orders/:orderId", authenticate, ctrl.getOrderById);
router.patch("/orders/:orderId/cancel", authenticate, ctrl.cancelOrder);

// ── Wishlist ──────────────────────────────────────────────────────────────────
router.get("/wishlist", authenticate, ctrl.getWishlist);
router.post("/wishlist", authenticate, ctrl.addToWishlist);
router.delete("/wishlist/:productId", authenticate, ctrl.removeFromWishlist);

// ── Recently Viewed ───────────────────────────────────────────────────────────
router.get("/recently-viewed", authenticate, ctrl.getRecentlyViewed);
router.post("/recently-viewed", authenticate, ctrl.trackRecentlyViewed);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/getAllUsers", authenticate, verifyAdmin, ctrl.getAlluserData);
router.get("/getAUserById/:id", authenticate, verifyAdmin, ctrl.findUserById);
router.put("/updateAUserById/:id", authenticate, verifyAdmin, ctrl.updateUserById);
router.delete("/deleteAUserById/:id", authenticate, verifyAdmin, ctrl.deleteUserById);
router.get("/admin/orders", authenticate, verifyAdmin, ctrl.adminGetAllOrders);
router.patch("/admin/orders/:userId/:orderId/status", authenticate, verifyAdmin, ctrl.adminUpdateOrderStatus);

module.exports = router;
