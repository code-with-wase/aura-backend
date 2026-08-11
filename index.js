import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import connectCloudinary from "./src/config/cloudinary.js";

import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import groupRoutes from "./src/routes/groupRoutes.js";
import statusRoutes from "./src/routes/statusRoutes.js";
import callRoutes from "./src/routes/callRoutes.js";

import {
  generalRateLimiter,
} from "./src/middleware/rateLimitMiddleware.js";

import { errorMiddleware } from "./src/middleware/errorMiddleware.js";

import { logger } from "./src/utils/logger.js";


// =========================
// LOAD ENVIRONMENT VARIABLES
// =========================

dotenv.config();


// =========================
// CREATE EXPRESS APP
// =========================

const app = express();


// =========================
// GLOBAL MIDDLEWARE
// =========================

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Request body
app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);


// =========================
// GENERAL RATE LIMITER
// =========================

app.use(generalRateLimiter);


// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Aura Connect API is running",
  });
});


// =========================
// API ROUTES
// =========================

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use("/group", groupRoutes);
app.use("/status", statusRoutes);
app.use("/call", callRoutes);


// =========================
// 404 ROUTE
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


// =========================
// GLOBAL ERROR HANDLER
// =========================

app.use(errorMiddleware);


// =========================
// SERVER PORT
// =========================

const PORT = process.env.PORT || 5000;


// =========================
// START SERVER
// =========================

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Configure Cloudinary
    connectCloudinary();

    // Start Express server
    app.listen(PORT, () => {
      logger.success(
        `Aura Connect server running on port ${PORT}`
      );

      logger.info(
        `Environment: ${process.env.NODE_ENV || "development"}`
      );
    });
  } catch (error) {
    logger.error(
      "Server startup failed",
      error
    );

    process.exit(1);
  }
};


// =========================
// START APPLICATION
// =========================

startServer();