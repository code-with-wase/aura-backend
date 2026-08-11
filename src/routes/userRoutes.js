import express from "express";


// =====================================================
// CONTROLLERS
// =====================================================

import {
  getMe,
  getUser,
  updateProfile,
  updatePrivacy,
  updateStatus,
  search,
} from "../controllers/userController.js";


// =====================================================
// MIDDLEWARE
// =====================================================

import { authMiddleware } from "../middleware/authMiddleware.js";

import { validate } from "../middleware/validationMiddleware.js";


// =====================================================
// SCHEMAS
// =====================================================

import {
  updateProfileSchema,
  updatePrivacySchema,
  updateStatusSchema,
  userIdSchema,
  searchUsersSchema,
} from "../schemas/userSchemas.js";


// =====================================================
// ROUTER
// =====================================================

const router = express.Router();


// =====================================================
// CURRENT USER
// GET /user/me
// =====================================================

router.get(
  "/me",
  authMiddleware,
  getMe
);


// =====================================================
// SEARCH USERS
// GET /user/search?search=abdul
// =====================================================

router.get(
  "/search",
  authMiddleware,
  validate(searchUsersSchema),
  search
);


// =====================================================
// GET USER BY ID
// GET /user/:userId
// =====================================================

router.get(
  "/:userId",
  authMiddleware,
  validate(userIdSchema),
  getUser
);


// =====================================================
// UPDATE PROFILE
// PUT /user/profile
// =====================================================

router.put(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile
);


// =====================================================
// UPDATE PRIVACY
// PUT /user/privacy
// =====================================================

router.put(
  "/privacy",
  authMiddleware,
  validate(updatePrivacySchema),
  updatePrivacy
);


// =====================================================
// UPDATE ONLINE STATUS
// PUT /user/status
// =====================================================

router.put(
  "/status",
  authMiddleware,
  validate(updateStatusSchema),
  updateStatus
);


export default router;