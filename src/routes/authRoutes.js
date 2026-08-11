import express from "express";

// =========================
// CONTROLLERS
// =========================

import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/authController.js";

// =========================
// MIDDLEWARE
// =========================

import { validate } from "../middleware/validationMiddleware.js";

import {
  authRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
} from "../middleware/rateLimitMiddleware.js";

// =========================
// VALIDATION SCHEMAS
// =========================

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../schemas/authSchemas.js";


// =========================
// ROUTER
// =========================

const router = express.Router();


// =====================================================
// REGISTER
// POST /auth/register
// =====================================================

router.post(
  "/register",
  registerRateLimiter,
  validate(registerSchema),
  register
);


// =====================================================
// LOGIN
// POST /auth/login
// =====================================================

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  login
);


// =====================================================
// REFRESH ACCESS TOKEN
// POST /auth/refresh-token
// =====================================================

router.post(
  "/refresh-token",
  authRateLimiter,
  validate(refreshTokenSchema),
  refreshToken
);


// =====================================================
// LOGOUT
// POST /auth/logout
// =====================================================

router.post(
  "/logout",
  logout
);


// =========================
// EXPORT ROUTER
// =========================

export default router;