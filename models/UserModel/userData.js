const mongoose = require("mongoose");
const Schema = mongoose.Schema
const UsersSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    job: {
        type: String,
        required: true,
    },
    profile_img: {
        type: String,
        required: true,
    }
});

const UserData = mongoose.model('user_details', UsersSchema);
module.exports = UserData;
