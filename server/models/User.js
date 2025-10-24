import mongoose from 'mongoose';

const { Schema } = mongoose;

const otpSchema = new Schema({
  code: String,
  expiresAt: Date,
});

const userSchema = new Schema({
  username: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  fullName: String,
  passwordHash: String,
  signupOtp: otpSchema, // OTP for signup verification
  resetOtp: otpSchema, // OTP for password reset
  refreshToken: String, // current refresh token (optional)
}, { timestamps: true });

export default mongoose.model('User', userSchema);