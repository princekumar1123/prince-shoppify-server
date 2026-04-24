const createError = require("http-errors");
const Review = require("../../models/ReviewModel/Review");
const productData = require("../../models/AdminModel/productsData");
const registerData = require("../../models/UserModel/UserRegister");

const handleAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

// Recalculate and save average rating + reviewCount on the product
const updateProductRating = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { productId: productId } },
        { $group: { _id: "$productId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const avgRating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const reviewCount = stats.length ? stats[0].count : 0;
    await productData.findByIdAndUpdate(productId, { rating: avgRating, reviewCount });
};

module.exports = {
    // ── GET reviews for a product ─────────────────────────────────────────────
    getProductReviews: handleAsync(async (req, res) => {
        const { productId } = req.params;
        const { sort = "newest", page = 1, limit = 10 } = req.query;

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            highest: { rating: -1 },
            lowest: { rating: 1 },
            helpful: { helpful: -1 },
        };

        const skip = (Number(page) - 1) * Number(limit);
        const [reviews, total] = await Promise.all([
            Review.find({ productId })
                .sort(sortMap[sort] || sortMap.newest)
                .skip(skip)
                .limit(Number(limit))
                .select("-helpfulVoters -__v")
                .lean(),
            Review.countDocuments({ productId }),
        ]);

        // Rating distribution (1-5 star counts)
        const distribution = await Review.aggregate([
            { $match: { productId: require("mongoose").Types.ObjectId.createFromHexString(productId) } },
            { $group: { _id: "$rating", count: { $sum: 1 } } },
        ]);
        const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach((d) => { ratingDist[d._id] = d.count; });

        res.json({
            status: true,
            reviews,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            ratingDistribution: ratingDist,
        });
    }),

    // ── Submit a review ───────────────────────────────────────────────────────
    submitReview: handleAsync(async (req, res) => {
        const { productId, rating, title, text } = req.body;
        const userId = req.user.id;

        // Check product exists
        const product = await productData.findById(productId);
        if (!product) throw createError(404, "Product not found.");

        // Check if user already reviewed this product
        const existing = await Review.findOne({ productId, userId });
        if (existing) throw createError(409, "You have already reviewed this product.");

        // Check if user purchased this product (verified purchase badge)
        const user = await registerData.findById(userId).select("name orders");
        const verifiedPurchase = user.orders.some((order) =>
            order.items.some((item) => item.productId.toString() === productId)
        );

        const review = new Review({
            productId,
            userId,
            userName: user.name,
            rating,
            title,
            text,
            verifiedPurchase,
        });

        await review.save();
        await updateProductRating(review.productId);

        res.status(201).json({ status: true, message: "Review submitted successfully", review });
    }),

    // ── Update own review ─────────────────────────────────────────────────────
    updateReview: handleAsync(async (req, res) => {
        const { reviewId } = req.params;
        const { rating, title, text } = req.body;

        const review = await Review.findOne({ _id: reviewId, userId: req.user.id });
        if (!review) throw createError(404, "Review not found or not yours.");

        review.rating = rating ?? review.rating;
        review.title = title ?? review.title;
        review.text = text ?? review.text;
        await review.save();
        await updateProductRating(review.productId);

        res.json({ status: true, message: "Review updated", review });
    }),

    // ── Delete own review ─────────────────────────────────────────────────────
    deleteReview: handleAsync(async (req, res) => {
        const { reviewId } = req.params;
        const review = await Review.findOneAndDelete({ _id: reviewId, userId: req.user.id });
        if (!review) throw createError(404, "Review not found or not yours.");
        await updateProductRating(review.productId);
        res.json({ status: true, message: "Review deleted" });
    }),

    // ── Mark review as helpful ────────────────────────────────────────────────
    markHelpful: handleAsync(async (req, res) => {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) throw createError(404, "Review not found.");
        if (review.userId.toString() === userId) throw createError(400, "You cannot vote on your own review.");

        const alreadyVoted = review.helpfulVoters.includes(userId);
        if (alreadyVoted) {
            review.helpfulVoters.pull(userId);
            review.helpful = Math.max(0, review.helpful - 1);
        } else {
            review.helpfulVoters.push(userId);
            review.helpful += 1;
        }
        await review.save();

        res.json({ status: true, helpful: review.helpful, voted: !alreadyVoted });
    }),

    // ── Get current user's reviews ────────────────────────────────────────────
    getMyReviews: handleAsync(async (req, res) => {
        const reviews = await Review.find({ userId: req.user.id })
            .populate("productId", "title image")
            .sort({ createdAt: -1 })
            .select("-helpfulVoters -__v")
            .lean();
        res.json({ status: true, reviews });
    }),

    // ── Check if user can review a product ────────────────────────────────────
    canReview: handleAsync(async (req, res) => {
        const { productId } = req.params;
        const userId = req.user.id;

        const [existing, user] = await Promise.all([
            Review.findOne({ productId, userId }),
            registerData.findById(userId).select("orders"),
        ]);

        const hasPurchased = user.orders.some((order) =>
            order.items.some((item) => item.productId.toString() === productId)
        );

        res.json({
            status: true,
            canReview: !existing,
            alreadyReviewed: !!existing,
            existingReview: existing || null,
            hasPurchased,
        });
    }),
};
