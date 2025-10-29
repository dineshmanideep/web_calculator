import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [process.env.CLIENT_URL || "http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Rate Limiting Configuration
const windowMs = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000; 
const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS || 100;

const limiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path === "/health" || req.path === "/";
  },
});
app.use(limiter);

// connect mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✓ MongoDB connected successfully"))
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err);
    process.exit(1); // Exit if database connection fails
  });

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      touchAfter: 24 * 3600, 
    }),
    cookie: {
      maxAge: 30 * 60 * 1000, 
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" ||
        process.env.COOKIE_SECURE === "true",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    },
  }),
);

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Web Calculator API",
    version: "1.0.0",
    status: "running",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ CORS allowed origins: ${allowedOrigins.join(", ")}`);
});
