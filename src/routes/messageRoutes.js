import express from "express";

import {
  sendMessage,
  getMessages,
  getMessage,
  editMessage,
  deleteMessage,
  markMessageDelivered,
  markMessageRead,
  addReaction,
  removeReaction,
  starMessage,
  unstarMessage,
  forwardMessage,
} from "../controllers/messageController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  validate,
} from "../middleware/validationMiddleware.js";

import {
  sendMessageSchema,
  getMessagesSchema,
  messageIdSchema,
  editMessageSchema,
  deleteMessageSchema,
  deliveredMessageSchema,
  readMessageSchema,
  reactionSchema,
  forwardMessageSchema,
} from "../schemas/messageSchemas.js";

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);

// =====================================================
// SEND MESSAGE
// POST /message
// =====================================================

router.post(
  "/",
  validate(sendMessageSchema),
  sendMessage
);

// =====================================================
// GET CHAT MESSAGES
// GET /message/chat/:chatId
// =====================================================

router.get(
  "/chat/:chatId",
  validate(getMessagesSchema),
  getMessages
);

// =====================================================
// GET SINGLE MESSAGE
// GET /message/:messageId
// =====================================================

router.get(
  "/:messageId",
  validate(messageIdSchema),
  getMessage
);

// =====================================================
// EDIT MESSAGE
// PATCH /message/:messageId
// =====================================================

router.patch(
  "/:messageId",
  validate(editMessageSchema),
  editMessage
);

// =====================================================
// DELETE MESSAGE
// DELETE /message/:messageId
// =====================================================

router.delete(
  "/:messageId",
  validate(deleteMessageSchema),
  deleteMessage
);

// =====================================================
// DELIVERED
// PATCH /message/:messageId/delivered
// =====================================================

router.patch(
  "/:messageId/delivered",
  validate(deliveredMessageSchema),
  markMessageDelivered
);

// =====================================================
// READ
// PATCH /message/:messageId/read
// =====================================================

router.patch(
  "/:messageId/read",
  validate(readMessageSchema),
  markMessageRead
);

// =====================================================
// ADD REACTION
// POST /message/:messageId/reaction
// =====================================================

router.post(
  "/:messageId/reaction",
  validate(reactionSchema),
  addReaction
);

// =====================================================
// REMOVE REACTION
// DELETE /message/:messageId/reaction
// =====================================================

router.delete(
  "/:messageId/reaction",
  validate(messageIdSchema),
  removeReaction
);

// =====================================================
// STAR
// POST /message/:messageId/star
// =====================================================

router.post(
  "/:messageId/star",
  validate(messageIdSchema),
  starMessage
);

// =====================================================
// UNSTAR
// DELETE /message/:messageId/star
// =====================================================

router.delete(
  "/:messageId/star",
  validate(messageIdSchema),
  unstarMessage
);

// =====================================================
// FORWARD
// POST /message/:messageId/forward
// =====================================================

router.post(
  "/:messageId/forward",
  validate(forwardMessageSchema),
  forwardMessage
);

export default router;