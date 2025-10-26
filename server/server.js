import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors({
      origin: "http://localhost:5173",
  credentials: true,  
}))
app.use(express.json());
const limiter =rateLimit({
  windowMs:15*60*1000, // 15 minutes
  max:100, // limit each IP to 100 requests per windowMs
  message:"Too many requests from this IP, please try again after 15 minutes",
  standardHeaders:true,
  legacyHeaders:false
});
app.use(limiter);

// connect mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log("Mongo connected"))
  .catch(err => console.error(err));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI ,
    collectionName: 'sessions' }),
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  }),
);

// mount routes
app.use("/api/auth", authRoutes);

app.listen(PORT, ()=> console.log("Server running on", PORT));
