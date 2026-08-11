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
// CREATE GROUP
// =====================================================

export const createGroupSchema =
  z.object({
    body: z.object({
      name: z
        .string()
        .trim()
        .min(
          2,
          "Group name must be at least 2 characters"
        )
        .max(
          100,
          "Group name cannot exceed 100 characters"
        ),

      description: z
        .string()
        .trim()
        .max(
          500,
          "Group description cannot exceed 500 characters"
        )
        .nullable()
        .optional(),

      avatar: z
        .string()
        .nullable()
        .optional(),

      avatarPublicId: z
        .string()
        .nullable()
        .optional(),

      memberIds: z
        .array(objectIdSchema)
        .max(
          999,
          "Too many members"
        )
        .optional()
        .default([]),
    }),
  });

// =====================================================
// GROUP ID
// =====================================================

export const groupIdSchema =
  z.object({
    params: z.object({
      groupId: objectIdSchema,
    }),
  });

// =====================================================
// UPDATE GROUP
// =====================================================

export const updateGroupSchema =
  z.object({
    params: z.object({
      groupId: objectIdSchema,
    }),

    body: z
      .object({
        name: z
          .string()
          .trim()
          .min(
            2,
            "Group name must be at least 2 characters"
          )
          .max(
            100,
            "Group name cannot exceed 100 characters"
          )
          .optional(),

        description: z
          .string()
          .trim()
          .max(
            500,
            "Group description cannot exceed 500 characters"
          )
          .nullable()
          .optional(),

        avatar: z
          .string()
          .nullable()
          .optional(),

        avatarPublicId: z
          .string()
          .nullable()
          .optional(),
      })
      .refine(
        (data) =>
          Object.keys(data).length > 0,
        {
          message:
            "At least one field is required",
        }
      ),
  });

// =====================================================
// ADD MEMBERS
// =====================================================

export const addMembersSchema =
  z.object({
    params: z.object({
      groupId: objectIdSchema,
    }),

    body: z.object({
      memberIds: z
        .array(objectIdSchema)
        .min(
          1,
          "At least one member ID is required"
        )
        .max(
          999,
          "Too many members"
        ),
    }),
  });

// =====================================================
// USER + GROUP ID
// =====================================================

export const groupUserSchema =
  z.object({
    params: z.object({
      groupId: objectIdSchema,
      userId: objectIdSchema,
    }),
  });

// =====================================================
// SETTINGS
// =====================================================

export const updateGroupSettingsSchema =
  z.object({
    params: z.object({
      groupId: objectIdSchema,
    }),

    body: z
      .object({
        onlyAdminsCanSendMessages:
          z.boolean().optional(),

        onlyAdminsCanEditInfo:
          z.boolean().optional(),

        onlyAdminsCanAddMembers:
          z.boolean().optional(),

        onlyAdminsCanRemoveMembers:
          z.boolean().optional(),
      })
      .refine(
        (data) =>
          Object.keys(data).length > 0,
        {
          message:
            "At least one setting is required",
        }
      ),
  });

// =====================================================
// MUTE
// =====================================================

export const muteGroupSchema =
  z.object({
    params: z.object({
      groupId: objectIdSchema,
    }),

    body: z.object({
      isMuted: z.boolean(),
    }),
  });   