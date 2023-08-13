//Chat model to chat with the admin, the user id and the residence id are required

// Path: src\models\Chat.js
// Compare this snippet from src\models\UpcomingTrip.js:
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    //The messages are an array of objects, each object has a message and a date and the tag user or admin

    messages: [{
        message: {
            type: String,
            required: true,
        },
        //Type of message either text or property card
        typeoFMessage: {
            type: String,
            enum: ['text', 'property'],
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        sender: {
            type: String,
            enum: ['user', 'admin'],
            required: true,
        },
    }],
});

module.exports = mongoose.model('Chat', chatSchema);