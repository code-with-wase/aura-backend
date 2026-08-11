import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    // =========================
    // STATUS OWNER
    // =========================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // STATUS TYPE
    // =========================

    type: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },

    // =========================
    // TEXT CONTENT
    // =========================

    content: {
      type: String,
      trim: true,
      maxlength: [700, "Status content cannot exceed 700 characters"],
      default: null,
    },

    // =========================
    // MEDIA
    // =========================

    media: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
        type: String,
        default: null,
      },

      mimeType: {
        type: String,
        default: null,
      },

      fileName: {
        type: String,
        default: null,
      },

      fileSize: {
        type: Number,
        default: null,
      },

      duration: {
        type: Number,
        default: null,
      },

      thumbnail: {
        type: String,
        default: null,
      },
    },

    // =========================
    // STATUS BACKGROUND
    // =========================

    background: {
      type: String,
      default: null,
    },

    // =========================
    // STATUS VIEWS
    // =========================

    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =========================
    // PRIVACY
    // =========================

    privacy: {
      type: String,
      enum: ["everyone", "contacts", "onlySharedWith"],
      default: "contacts",
    },

    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =========================
    // STATUS EXPIRATION
    // =========================

    expiresAt: {
      type: Date,
      required: true,
    },

    // =========================
    // STATUS STATE
    // =========================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

statusSchema.index({
  user: 1,
  createdAt: -1,
});

statusSchema.index({
  expiresAt: 1,
});

statusSchema.index({
  "viewers.user": 1,
});

// =========================
// AUTOMATIC EXPIRATION
// =========================

statusSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Status = mongoose.model("Status", statusSchema);

export default Status;