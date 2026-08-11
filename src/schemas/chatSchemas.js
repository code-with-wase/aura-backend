import { z } from "zod";

// =========================
// CREATE PRIVATE CHAT
// =========================

export const createPrivateChatSchema = z.object({
  body: z.object({
    userId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid user ID"
      ),
  }),
});

// =========================
// CHAT ID
// =========================

export const chatIdSchema = z.object({
  params: z.object({
    chatId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid chat ID"
      ),
  }),
});

// =========================
// UPDATE CHAT SETTINGS
// =========================

export const updateChatSettingsSchema = z.object({
  params: z.object({
    chatId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid chat ID"
      ),
  }),

  body: z.object({
    isMuted: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    isPinned: z.boolean().optional(),
  }),
});