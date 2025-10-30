import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  expr: { type: String, required: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }, // Admin role flag
    isSuspended: { type: Boolean, default: false }, // Account suspension flag
    suspendedAt: { type: Date }, // When the account was suspended
    signupOtp: {
      code: String,
      expiresAt: Date,
    },
    resetOtp: {
      code: String,
      expiresAt: Date,
    },
    lastLogin: { type: Date }, // Track last login time
    lastLogout: { type: Date }, // Track last logout time
    lastActivity: { type: Date }, // Track last API activity time
    history: [historySchema], // Add this line
    isEmailVerified: { type: Boolean, default: false }, // Email verification status
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
