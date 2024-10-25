const mongoose = require('mongoose');


const otpSchema = new mongoose.Schema({
  identifier: { 
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: Date.now() + 3 * 60 * 60 * 1000,
  },
});


const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;
