const mongoose = require("mongoose");
const Schema = mongoose.Schema
const RegisterSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: false
    },
    mobile: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
});

const registerData = mongoose.model('register', RegisterSchema);
module.exports = registerData;
