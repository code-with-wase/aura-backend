import { z } from "zod";

// =====================================================
// NOTIFICATION ID
// =====================================================

const notificationIdSchema = z.object({
  params: z.object({
    notificationId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid MongoDB ObjectId"
      ),
  }),
});

// =====================================================
// GET NOTIFICATIONS
// =====================================================

const getNotificationsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a positive number")
      .optional(),

    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a positive number")
      .optional(),

    unreadOnly: z
      .enum(["true", "false"])
      .optional(),
  }),
});

// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotificationSchema = z.object({
  body: z.object({
    recipientId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid recipient ID"
      ),

    type: z.enum([
      "message",
      "reaction",
      "reply",
      "mention",
      "group_invite",
      "group_added",
      "group_removed",
      "group_admin",
      "call",
      "status",
      "system",
    ]),

    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200),

    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(500),

    chatId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid chat ID"
      )
      .optional(),

    messageId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid message ID"
      )
      .optional(),

    callId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid call ID"
      )
      .optional(),

    statusId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid status ID"
      )
      .optional(),

    groupId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid group ID"
      )
      .optional(),

    data: z
      .record(z.string(), z.any())
      .optional(),
  }),
});

export {
  notificationIdSchema,
  getNotificationsSchema,
  createNotificationSchema,
}; 