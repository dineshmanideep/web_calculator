import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow null for failed login attempts
    },
    username: { type: String }, // Store username for easier display
    email: { type: String }, // Store email for easier display
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "LOGOUT",
        "SIGNUP",
        "SIGNUP_VERIFY",
        "PASSWORD_RESET_REQUEST",
        "PASSWORD_RESET_SUCCESS",
        "HISTORY_SAVE",
        "HISTORY_CLEAR",
        "ADMIN_ACCESS",
        "UNAUTHORIZED_ACCESS",
        "SESSION_EXPIRED"
      ],
    },
    details: { type: String }, // Additional information about the action
    input: { type: String }, // For auth actions: email/username attempted, route accessed, etc.
    result: { type: String }, // For auth actions: success/failure message, outcome description
    ipAddress: { type: String },
    userAgent: { type: String },
    deviceType: { type: String }, // Desktop, Mobile, Tablet
    browser: { type: String }, // Chrome, Firefox, Safari, etc.
    os: { type: String }, // Windows, macOS, Linux, Android, iOS
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "ERROR", "INFO"],
      default: "SUCCESS",
    },
    errorMessage: { type: String }, // Store error details if any
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index for faster queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
