const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../../middleware/validate");
const { authenticate } = require("../../middleware/verifyToken");
const ctrl = require("../../controllers/ReviewController/reviewController");

const reviewRules = [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("title").trim().notEmpty().withMessage("Review title is required").isLength({ max: 120 }).withMessage("Title too long"),
    body("text").trim().notEmpty().withMessage("Review text is required").isLength({ max: 2000 }).withMessage("Review too long"),
];

// Public
router.get("/product/:productId", ctrl.getProductReviews);

// Protected
router.post("/", authenticate, reviewRules, validate, ctrl.submitReview);
router.put("/:reviewId", authenticate, ctrl.updateReview);
router.delete("/:reviewId", authenticate, ctrl.deleteReview);
router.post("/:reviewId/helpful", authenticate, ctrl.markHelpful);
router.get("/my/reviews", authenticate, ctrl.getMyReviews);
router.get("/can-review/:productId", authenticate, ctrl.canReview);

module.exports = router;
