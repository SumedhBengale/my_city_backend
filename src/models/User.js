//User Model with userName, email, password in mongoose

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: true
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    verificationToken: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
    },
    type: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    },
}, { timestamps: true, collection: 'users' });

module.exports = mongoose.model('User', userSchema);
