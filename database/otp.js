const path = require("path");
const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  Email: {
    type: String,
    required: true,
    lowercase: true,
    minLength: 7,
    maxLength: 50,
  },
  Otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
    expires: 120,
  },
});

module.exports = new mongoose.model("Otp", otpSchema);