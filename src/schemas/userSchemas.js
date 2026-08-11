import { z } from "zod";


// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(
          2,
          "Name must be at least 2 characters"
        )
        .max(
          50,
          "Name cannot exceed 50 characters"
        )
        .optional(),

      username: z
        .string()
        .trim()
        .min(
          3,
          "Username must be at least 3 characters"
        )
        .max(
          30,
          "Username cannot exceed 30 characters"
        )
        .regex(
          /^[a-zA-Z0-9._]+$/,
          "Username can only contain letters, numbers, dots and underscores"
        )
        .optional(),

      about: z
        .string()
        .trim()
        .max(
          150,
          "About cannot exceed 150 characters"
        )
        .optional(),
    })
    .strict(),
});


// =====================================================
// PRIVACY SETTINGS
// =====================================================

export const updatePrivacySchema = z.object({
  body: z
    .object({
      lastSeen: z
        .enum([
          "everyone",
          "contacts",
          "nobody",
        ])
        .optional(),

      profilePhoto: z
        .enum([
          "everyone",
          "contacts",
          "nobody",
        ])
        .optional(),

      about: z
        .enum([
          "everyone",
          "contacts",
          "nobody",
        ])
        .optional(),

      readReceipts: z
        .boolean()
        .optional(),
    })
    .strict(),
});


// =====================================================
// ONLINE STATUS
// =====================================================

export const updateStatusSchema = z.object({
  body: z.object({
    isOnline: z.boolean(),
  }),
});


// =====================================================
// USER ID
// =====================================================

export const userIdSchema = z.object({
  params: z.object({
    userId: z
      .string()
      .min(1, "User ID is required"),
  }),
});


// =====================================================
// SEARCH USERS
// =====================================================

export const searchUsersSchema = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .min(
        1,
        "Search value is required"
      )
      .max(
        50,
        "Search value cannot exceed 50 characters"
      ),
  }),
});