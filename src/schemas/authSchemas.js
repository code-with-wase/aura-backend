import { z } from "zod";


// =========================
// REGISTER SCHEMA
// =========================

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: "Name is required",
      })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),

    username: z
      .string({
        error: "Username is required",
      })
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9._]+$/,
        "Username can only contain letters, numbers, dots and underscores"
      )
      .transform((value) => value.toLowerCase()),

    email: z
      .string({
        error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .transform((value) => value.toLowerCase()),

    phone: z
      .string({
        error: "Phone number is required",
      })
      .trim()
      .min(10, "Phone number must be at least 10 characters")
      .max(15, "Phone number cannot exceed 15 characters")
      .regex(
        /^[0-9]+$/,
        "Phone number can only contain digits"
      ),

    password: z
      .string({
        error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password cannot exceed 100 characters"),
  }),
});


// =========================
// LOGIN SCHEMA
// =========================

export const loginSchema = z.object({
  body: z.object({
    identifier: z
      .string({
        error: "Email, username or phone number is required",
      })
      .trim()
      .min(
        1,
        "Email, username or phone number is required"
      ),

    password: z
      .string({
        error: "Password is required",
      })
      .min(1, "Password is required"),
  }),
});


// =========================
// REFRESH TOKEN SCHEMA
// =========================

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({
        error: "Refresh token is required",
      })
      .trim()
      .min(1, "Refresh token is required"),
  }),
});