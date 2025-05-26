const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otpCode: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // createdAt and updatedAt
});

// Optional: Automatically delete expired OTPs after expiry date
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
