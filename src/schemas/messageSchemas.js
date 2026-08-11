import { z } from "zod";

// =====================================================
// COMMON OBJECT ID
// =====================================================

const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId"
  );

// =====================================================
// SEND MESSAGE
// POST /message
// =====================================================

export const sendMessageSchema = z.object({
  body: z
    .object({
      chatId: objectIdSchema,

      type: z
        .enum([
          "text",
          "image",
          "video",
          "audio",
          "document",
          "location",
          "contact",
        ])
        .default("text"),

      content: z
        .string()
        .trim()
        .max(
          5000,
          "Message content cannot exceed 5000 characters"
        )
        .nullable()
        .optional(),

      attachment: z
        .any()
        .nullable()
        .optional(),

      replyTo: objectIdSchema
        .nullable()
        .optional(),

      isForwarded: z
        .boolean()
        .optional()
        .default(false),

      forwardedFrom: objectIdSchema
        .nullable()
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.type === "text" &&
        (!data.content ||
          !data.content.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["content"],
          message:
            "Message content is required for text messages",
        });
      }

      if (
        data.isForwarded === true &&
        !data.forwardedFrom
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["forwardedFrom"],
          message:
            "forwardedFrom is required when isForwarded is true",
        });
      }
    }),
});

// =====================================================
// GET CHAT MESSAGES
// GET /message/chat/:chatId
// =====================================================

export const getMessagesSchema = z.object({
  params: z.object({
    chatId: objectIdSchema,
  }),

  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(50),
  }),
});

// =====================================================
// MESSAGE ID
// =====================================================

export const messageIdSchema = z.object({
  params: z.object({
    messageId: objectIdSchema,
  }),
});

// =====================================================
// EDIT MESSAGE
// PATCH /message/:messageId
// =====================================================

export const editMessageSchema = z.object({
  params: z.object({
    messageId: objectIdSchema,
  }),

  body: z.object({
    content: z
      .string()
      .trim()
      .min(
        1,
        "Message content is required"
      )
      .max(
        5000,
        "Message content cannot exceed 5000 characters"
      ),
  }),
});

// =====================================================
// DELETE MESSAGE
// DELETE /message/:messageId
// =====================================================

export const deleteMessageSchema = z.object({
  params: z.object({
    messageId: objectIdSchema,
  }),

  body: z
    .object({
      deleteForEveryone: z
        .boolean()
        .optional()
        .default(false),
    })
    .optional()
    .default({}),
});

// =====================================================
// DELIVERED
// PATCH /message/:messageId/delivered
// =====================================================

export const deliveredMessageSchema =
  z.object({
    params: z.object({
      messageId: objectIdSchema,
    }),
  });

// =====================================================
// READ
// PATCH /message/:messageId/read
// =====================================================

export const readMessageSchema =
  z.object({
    params: z.object({
      messageId: objectIdSchema,
    }),
  });

// =====================================================
// ADD REACTION
// POST /message/:messageId/reaction
// =====================================================

export const reactionSchema = z.object({
  params: z.object({
    messageId: objectIdSchema,
  }),

  body: z.object({
    emoji: z
      .string()
      .trim()
      .min(
        1,
        "Reaction emoji is required"
      )
      .max(
        20,
        "Reaction emoji is too long"
      ),
  }),
});

// =====================================================
// FORWARD MESSAGE
// POST /message/:messageId/forward
// =====================================================

export const forwardMessageSchema =
  z.object({
    params: z.object({
      messageId: objectIdSchema,
    }),

    body: z.object({
      chatId: objectIdSchema,
    }),
  });
