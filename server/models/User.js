import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  code: String,
  expiresAt: Date,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // could be email
  email: { type: String, required: true, unique: true },
  fullName: String,
  passwordHash: String,
  isVerified: { type: Boolean, default: false }, // verified by signup OTP
  signupOtp: otpSchema,      // OTP for signup verification
  resetOtp: otpSchema,       // OTP for password reset
  refreshToken: String,      // current refresh token (optional)
}, { timestamps: true });

export default mongoose.model("User", userSchema);
