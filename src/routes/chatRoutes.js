import express from "express";

import {
  createChat,
  getChats,
  getChat,
  updateSettings,
  markAsRead,
  leave,
} from "../controllers/chatController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

import { validate } from "../middleware/validationMiddleware.js";

import {
  createPrivateChatSchema,
  chatIdSchema,
  updateChatSettingsSchema,
} from "../schemas/chatSchemas.js";

const router = express.Router();

// =========================
// ALL CHAT ROUTES
// REQUIRE AUTHENTICATION
// =========================

router.use(authMiddleware);

// =========================
// CREATE PRIVATE CHAT
// =========================

router.post(
  "/",
  validate(createPrivateChatSchema),
  createChat
);

// =========================
// GET MY CHATS
// =========================

router.get(
  "/",
  getChats
);

// =========================
// GET CHAT BY ID
// =========================

router.get(
  "/:chatId",
  validate(chatIdSchema),
  getChat
);

// =========================
// UPDATE CHAT SETTINGS
// =========================

router.patch(
  "/:chatId/settings",
  validate(updateChatSettingsSchema),
  updateSettings
);

// =========================
// MARK CHAT AS READ
// =========================

router.patch(
  "/:chatId/read",
  validate(chatIdSchema),
  markAsRead
);

// =========================
// LEAVE CHAT
// =========================

router.delete(
  "/:chatId/leave",
  validate(chatIdSchema),
  leave
);

export default router; 