import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    // =========================
    // USER REFERENCE
    // =========================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // REFRESH TOKEN
    // =========================

    token: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    // =========================
    // TOKEN EXPIRATION
    // =========================

    expiresAt: {
      type: Date,
      required: true,
    },

    // =========================
    // TOKEN REVOCATION
    // =========================

    isRevoked: {
      type: Boolean,
      default: false,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // SESSION INFORMATION
    // =========================

    userAgent: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired refresh tokens
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshToken;