import express from "express";

import {
  createStatus,
  getStatuses,
  getMyStatuses,
  getStatus,
  viewStatus,
  deleteStatus,
} from "../controllers/statusController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  validate,
} from "../middleware/validationMiddleware.js";

import {
  createStatusSchema,
  statusIdSchema,
} from "../schemas/statusSchemas.js";

const router = express.Router();

// =====================================================
// ALL STATUS ROUTES REQUIRE AUTH
// =====================================================

router.use(authMiddleware);

// =====================================================
// CREATE STATUS
// POST /status
// =====================================================

router.post(
  "/",
  validate(createStatusSchema),
  createStatus
);

// =====================================================
// GET AVAILABLE STATUSES
// GET /status
// =====================================================

router.get(
  "/",
  getStatuses
);

// =====================================================
// GET MY STATUSES
// GET /status/me
// =====================================================

router.get(
  "/me",
  getMyStatuses
);

// =====================================================
// GET SINGLE STATUS
// GET /status/:statusId
// =====================================================

router.get(
  "/:statusId",
  validate(statusIdSchema),
  getStatus
);

// =====================================================
// VIEW STATUS
// POST /status/:statusId/view
// =====================================================

router.post(
  "/:statusId/view",
  validate(statusIdSchema),
  viewStatus
);

// =====================================================
// DELETE STATUS
// DELETE /status/:statusId
// =====================================================

router.delete(
  "/:statusId",
  validate(statusIdSchema),
  deleteStatus
);

export default router;