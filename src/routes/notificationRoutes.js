import express from "express";

import {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  getNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

import { validate } from "../middleware/validationMiddleware.js";

import {
  notificationIdSchema,
  getNotificationsSchema,
  createNotificationSchema,
} from "../schemas/notificationSchemas.js";

const router = express.Router();

// =====================================================
// ALL NOTIFICATION ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authMiddleware);

// =====================================================
// CREATE NOTIFICATION
// POST /notification
// =====================================================

router.post(
  "/",
  validate(createNotificationSchema),
  createNotification
);

// =====================================================
// GET ALL NOTIFICATIONS
// GET /notification
// =====================================================

router.get(
  "/",
  validate(getNotificationsSchema),
  getNotifications
);

// =====================================================
// GET UNREAD NOTIFICATIONS
// GET /notification/unread
// =====================================================

router.get(
  "/unread",
  validate(getNotificationsSchema),
  getUnreadNotifications
);

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /notification/read-all
// =====================================================

router.patch(
  "/read-all",
  markAllNotificationsAsRead
);

// =====================================================
// DELETE ALL NOTIFICATIONS
// DELETE /notification/all
// =====================================================

router.delete(
  "/all",
  deleteAllNotifications
);

// =====================================================
// GET SINGLE NOTIFICATION
// GET /notification/:notificationId
// =====================================================

router.get(
  "/:notificationId",
  validate(notificationIdSchema),
  getNotification
);

// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /notification/:notificationId/read
// =====================================================

router.patch(
  "/:notificationId/read",
  validate(notificationIdSchema),
  markNotificationAsRead
);

// =====================================================
// DELETE SINGLE NOTIFICATION
// DELETE /notification/:notificationId
// =====================================================

router.delete(
  "/:notificationId",
  validate(notificationIdSchema),
  deleteNotification  
);

export default router;  