const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountTier: {
    type: String,
    enum: ["FREE", "PRO", "PREMIUM"],
    default: "FREE",
  },
  storageQuota: {
    type: Number,
    default: 5000,
  },
  usedStorage: {
    type: Number,
    default: 0,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  verificationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", UserSchema);
