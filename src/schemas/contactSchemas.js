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
// USER ID
// =====================================================

export const userIdSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});

// =====================================================
// SEARCH USERS
// GET /contact/search?q=
// =====================================================

export const searchContactsSchema = z.object({
  query: z.object({
    q: z
      .string()
      .trim()
      .min(1, "Search query is required")
      .max(100, "Search query cannot exceed 100 characters"),

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

// =====================================================
// GET CONTACTS
// GET /contact
// =====================================================

export const getContactsSchema = z.object({
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

// =====================================================
// SYNC / MATCH PHONE CONTACTS
// POST /contact/sync
// =====================================================

export const syncPhoneContactsSchema = z.object({
  body: z.object({
    phoneNumbers: z
      .array(
        z
          .string()
          .trim()
          .min(
            3,
            "Invalid phone number"
          )
          .max(
            30,
            "Phone number cannot exceed 30 characters"
          )
      )
      .min(
        1,
        "At least one phone number is required"
      )
      .max(
        5000,
        "You can sync a maximum of 5000 phone contacts at once"
      ),
  }),
});

// =====================================================
// ADD CONTACT
// POST /contact/:userId
// =====================================================

export const addContactSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});

// =====================================================
// REMOVE CONTACT
// DELETE /contact/:userId
// =====================================================

export const removeContactSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});

// =====================================================
// BLOCK / UNBLOCK
// PATCH /contact/:userId/block
// PATCH /contact/:userId/unblock
// =====================================================

export const blockContactSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});  