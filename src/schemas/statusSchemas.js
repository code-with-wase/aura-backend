import { z } from "zod";

// =====================================================
// OBJECT ID
// =====================================================

const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId"
  );

// =====================================================
// MEDIA SCHEMA
// =====================================================

const mediaSchema = z
  .object({
    url: z
      .string()
      .trim()
      .optional(),

    publicId: z
      .string()
      .trim()
      .optional()
      .nullable(),

    mimeType: z
      .string()
      .trim()
      .optional()
      .nullable(),

    fileName: z
      .string()
      .trim()
      .optional()
      .nullable(),

    fileSize: z
      .number()
      .nonnegative()
      .optional()
      .nullable(),

    duration: z
      .number()
      .nonnegative()
      .optional()
      .nullable(),

    thumbnail: z
      .string()
      .trim()
      .optional()
      .nullable(),
  })
  .optional()
  .nullable();

// =====================================================
// CREATE STATUS
// =====================================================

export const createStatusSchema =
  z
    .object({
      body: z.object({
        type: z.enum(
          ["text", "image", "video"],
          {
            message:
              "Status type must be text, image or video",
          }
        ),

        content: z
          .string()
          .trim()
          .max(
            700,
            "Status content cannot exceed 700 characters"
          )
          .optional()
          .nullable(),

        media: mediaSchema,

        background: z
          .string()
          .trim()
          .optional()
          .nullable(),

        privacy: z
          .enum(
            [
              "everyone",
              "contacts",
              "onlySharedWith",
            ],
            {
              message:
                "Invalid status privacy",
            }
          )
          .optional()
          .default("contacts"),

        sharedWith: z
          .array(objectIdSchema)
          .optional()
          .default([]),
      }),
    })
    .superRefine((data, ctx) => {
      const body = data.body;

      // Text validation
      if (body.type === "text") {
        if (
          !body.content ||
          !body.content.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "content"],
            message:
              "Content is required for text status",
          });
        }

        if (body.media) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "media"],
            message:
              "Media is not allowed for text status",
          });
        }
      }

      // Image / video validation
      if (
        body.type === "image" ||
        body.type === "video"
      ) {
        if (
          !body.media ||
          !body.media.url ||
          !body.media.url.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "media", "url"],
            message:
              "Media URL is required for image or video status",
          });
        }
      }

      // onlySharedWith validation
      if (
        body.privacy ===
        "onlySharedWith"
      ) {
        if (
          !body.sharedWith ||
          body.sharedWith.length === 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [
              "body",
              "sharedWith",
            ],
            message:
              "sharedWith is required when privacy is onlySharedWith",
          });
        }
      }
    });

// =====================================================
// STATUS ID
// =====================================================

export const statusIdSchema =
  z.object({
    params: z.object({
      statusId: objectIdSchema,
    }),
  });  