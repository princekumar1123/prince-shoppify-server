const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../../middleware/validate");
const { authenticate } = require("../../middleware/verifyToken");
const { verifyAdmin } = require("../../middleware/verifyAdmin");
const adminController = require("../../controllers/AdminController/ProductsController");

// ── Validation rules ──────────────────────────────────────────────────────────
const productRules = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("brand").optional().trim(),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
    body("maxPrice").isFloat({ min: 0 }).withMessage("Max price must be a positive number"),
    body("discount").isFloat({ min: 0, max: 100 }).withMessage("Discount must be between 0 and 100"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("sellerName").trim().notEmpty().withMessage("Seller name is required"),
    body("stockStatus").optional().isIn(["in_stock", "out_of_stock", "limited"]).withMessage("Invalid stock status"),
];

// ── Public routes ─────────────────────────────────────────────────────────────
router.get("/getproducts", adminController.getAllProducts);
router.get("/getproductbyid/:id", adminController.getProductById);

// ── Protected routes (admin only) ────────────────────────────────────────────
router.post("/addproduct", authenticate, verifyAdmin, productRules, validate, adminController.addProduct);
router.put("/updateproduct/:id", authenticate, verifyAdmin, adminController.updateProduct);
router.delete("/deleteproduct/:id", authenticate, verifyAdmin, adminController.deleteProduct);

module.exports = router;
