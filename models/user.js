const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures that the email is unique
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum length for password
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
