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
import uploadRoutes from "./src/routes/uploadRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import dns from 'dns';
dns.setServers(["1.1.1.1","8.8.8.8"]);

import {
  generalRateLimiter,
} from "./src/middleware/rateLimitMiddleware.js";

import { errorMiddleware } from "./src/middleware/errorMiddleware.js";

import { logger } from "./src/utils/logger.js";

// =====================================================
// ENVIRONMENT
// =====================================================

dotenv.config();

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// APP INITIALIZATION CACHE
// =====================================================

let initializationPromise = null;

const initializeApp = async () => {
  if (!initializationPromise) {
    initializationPromise = Promise.all([
      connectDB(),
      Promise.resolve(connectCloudinary()),
    ]).then(() => {
      logger.success(
        "Aura Connect API initialized successfully"
      );
    });
  }

  try {
    await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
};

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =====================================================
// RATE LIMITER
// =====================================================

app.use(generalRateLimiter);

// =====================================================
// DATABASE INITIALIZATION MIDDLEWARE
// =====================================================

app.use(async (req, res, next) => {
  try {
    await initializeApp();
    next();
  } catch (error) {
    next(error);
  }
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Aura Connect API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use("/group", groupRoutes);
app.use("/status", statusRoutes);
app.use("/call", callRoutes);
app.use("/upload", uploadRoutes);
app.use("/notification", notificationRoutes);
app.use("/contact", contactRoutes);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(errorMiddleware);

// =====================================================
// VERCEL EXPORT
// =====================================================


// =====================================================
// LOCAL SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  initializeApp()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Aura Connect API running on port ${PORT}`);
        console.log(`http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Application initialization failed:");
      console.error(error);
      process.exit(1);
    });
}

// =====================================================
// VERCEL EXPORT
// =====================================================

export default app;    