const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 30,
    immutable: true,
  },
  PhoneNumber: {
    type: Number,
    required: true,
    minLength: 10,
    maxLength: 10,
    immutable: true,
  },
  Email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    minLength: 7,
    maxLength: 50,
    immutable: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Verified: {
    type: Boolean,
    required: true,
  },
  HaveImage: {
    type: Boolean,
    required: true,
  },
  CreatedAt: {
    type: Date,
    immutable: true,
    default: () => new Date(),
  },
  UpdatedAt: {
    type: Date,
    default: () => new Date(),
  },
});

module.exports = new mongoose.model("User", userSchema);
