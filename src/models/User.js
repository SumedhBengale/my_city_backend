//User Model with userName, email, password in mongoose

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    authType: {
        type: String,
        default: "local",
        enum: ["local", "google", "facebook"]
    },
    facebookId: {
        type: String,
        required: false,
    },
    googleId: {
        type: String,
        required: false,
    },
    userName: {
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: false
    },
    email: {
        type: String,
        required: false,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required:
            function () {
                return this.authType === "local";
            },
        min: 6
    },
    verificationToken: {
        type: String,
        required: function () { return this.authType === "local"; }
    },
    passwordResetToken: {
        type: String,
        required: false,
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
