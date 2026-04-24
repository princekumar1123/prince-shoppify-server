const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        brand: { type: String, trim: true, default: "" },
        category: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        highlights: { type: [String], default: [] },
        maxPrice: { type: Number, required: true, min: 0 },
        discount: { type: Number, required: true, min: 0, max: 100 },
        quantity: { type: Number, required: true, min: 0 },
        stockStatus: {
            type: String,
            enum: ["in_stock", "out_of_stock", "limited"],
            default: "in_stock",
        },
        offers: { type: [String], default: [] },
        image: { type: [String], required: true },
        sellerName: { type: String, required: true, trim: true },
        colors: { type: [String], default: [] },

        // ── Amazon-style fields ───────────────────────────────────────────────
        warranty: { type: String, trim: true, default: "" },          // "1 Year Manufacturer Warranty"
        returnPolicy: { type: String, trim: true, default: "" },      // "10 days returnable"
        deliveryInfo: { type: String, trim: true, default: "" },      // "Free delivery by Tomorrow"
        countryOfOrigin: { type: String, trim: true, default: "" },   // "India"
        inTheBox: { type: String, trim: true, default: "" },          // "1 Phone, 1 Charger, 1 Cable"
        weight: { type: String, trim: true, default: "" },            // "185g"
        dimensions: { type: String, trim: true, default: "" },        // "163.3 x 78.1 x 8.9 mm"
        tags: { type: [String], default: [] },                        // ["smartphone", "5g", "samsung"]

        // ── Computed from reviews ─────────────────────────────────────────────
        rating: { type: Number, min: 0, max: 5, default: 0 },
        reviewCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const ProductData = mongoose.model("productsDdata", ProductSchema);
module.exports = ProductData;
