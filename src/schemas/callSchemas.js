import { z } from "zod";
import mongoose from "mongoose";

// =====================================================
// OBJECT ID VALIDATOR
// =====================================================

const objectIdSchema = z
  .string()
  .refine(
    (value) => mongoose.Types.ObjectId.isValid(value),
    {
      message: "Invalid MongoDB ObjectId",
    }
  );

// =====================================================
// CREATE CALL
// POST /call
// =====================================================

export const createCallSchema = z.object({
  body: z
    .object({
      type: z.enum(["audio", "video"], {
        message: "Call type must be audio or video",
      }),

      mode: z
        .enum(["private", "group"], {
          message: "Call mode must be private or group",
        })
        .default("private"),

      chatId: objectIdSchema,

      participantIds: z
        .array(objectIdSchema)
        .min(1, {
          message:
            "At least one participant is required",
        }),
    })
    .strict(),
});

// =====================================================
// CALL ID
// =====================================================

export const callIdSchema = z.object({
  params: z.object({
    callId: objectIdSchema,
  }),
});

// =====================================================
// UPDATE CALL STATUS
// PATCH /call/:callId/ringing
// PATCH /call/:callId/join
// PATCH /call/:callId/decline
// PATCH /call/:callId/leave
// =====================================================

export const callStatusSchema = z.object({
  params: z.object({
    callId: objectIdSchema,
  }),
});

// =====================================================
// END CALL
// PATCH /call/:callId/end
// =====================================================

export const endCallSchema = z.object({
  params: z.object({
    callId: objectIdSchema,
  }),

  body: z
    .object({
      reason: z
        .enum([
          "completed",
          "rejected",
          "missed",
          "cancelled",
          "busy",
          "network_error",
        ])
        .optional(),
    })
    .default({}),
});

// =====================================================
// GET CALL HISTORY
// GET /call/history
// =====================================================

export const getCallHistorySchema = z.object({
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
      .default(20),
  }),
});