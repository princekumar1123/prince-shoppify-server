const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const CartItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "productsDdata", required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
    },
    { _id: false }
);

const AddressSchema = new Schema(
    {
        fullName: { type: String, required: true, trim: true },
        mobile: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, trim: true, default: "" },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        addressType: { type: String, enum: ["home", "work", "other"], default: "home" },
        isDefault: { type: Boolean, default: false },
    },
    { _id: true, timestamps: true }
);

const OrderItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "productsDdata", required: true },
        title: { type: String, required: true },
        image: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    },
    { _id: false }
);

const StatusHistorySchema = new Schema(
    {
        status: { type: String, required: true },
        message: { type: String, default: "" },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const OrderSchema = new Schema(
    {
        items: [OrderItemSchema],
        totalAmount: { type: Number, required: true },
        deliveryAddress: {
            fullName: String,
            mobile: String,
            pincode: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"],
            default: "confirmed",
        },
        statusHistory: { type: [StatusHistorySchema], default: [] },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        expectedDelivery: { type: Date },
        placedAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const RegisterSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        gender: { type: String, enum: ["male", "female", "other"], required: false },
        mobile: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        addresses: { type: [AddressSchema], default: [] },
        addToCart: { type: [CartItemSchema], default: [] },
        orders: { type: [OrderSchema], default: [] },
        wishlist: { type: [{ type: Schema.Types.ObjectId, ref: "productsDdata" }], default: [] },
        recentlyViewed: {
            type: [
                {
                    productId: { type: Schema.Types.ObjectId, ref: "productsDdata", required: true },
                    viewedAt: { type: Date, default: Date.now },
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
);

const registerData = mongoose.model("register", RegisterSchema);
module.exports = registerData;
