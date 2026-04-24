const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "productsDdata",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "register",
            required: true,
        },
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        text: { type: String, required: true, trim: true, maxlength: 2000 },
        verifiedPurchase: { type: Boolean, default: false },
        helpful: { type: Number, default: 0 },
        helpfulVoters: [{ type: Schema.Types.ObjectId, ref: "register" }],
    },
    { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
