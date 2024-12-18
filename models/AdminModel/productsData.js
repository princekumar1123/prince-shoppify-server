const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    offers: {
        type: [String],
        default: [],
    },
    description: {
        type: String,
        required: true,
    },
    maxPrice: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    image: {
        type: [String], 
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true,
    },
    review: {
        type: [String], 
        default: [],
    },
    sellerName: {
        type: String,
        required: true,
    },
    colors: {
        type: [String], 
        default: [],
    },
    category:{
        type:String,
        required:true
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const ProductData = mongoose.model('productsDdata', ProductSchema);
module.exports = ProductData;