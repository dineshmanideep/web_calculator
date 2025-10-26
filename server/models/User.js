import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  expr: { type: String, required: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  fullName: { type: String },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  signupOtp: {
    code: String,
    expiresAt: Date,
  },
  resetOtp: {
    code: String,
    expiresAt: Date,
  },
  history: [historySchema], // Add this line
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;