import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
      origin: "http://localhost:5173", // your Vite frontend
  credentials: true,  
}))

// connect mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log("Mongo connected"))
  .catch(err => console.error(err));

// mount routes
app.use("/api/auth", authRoutes);

// example protected route
import { verifyAccessToken } from "./middleware/auth.js";
app.get("/api/profile", verifyAccessToken, (req, res) => {
  res.json({ userId: req.userId });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log("Server running on", PORT));
