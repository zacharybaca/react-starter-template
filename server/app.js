import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const corsOptions = {
  // Allow requests from your Vite frontend
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, // Critical for cookies/sessions
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser()); // Must come before routes to parse JWT cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Error handling
app.use(errorHandler);

export default app;
