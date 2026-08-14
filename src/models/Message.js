import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // =========================
    // CHAT REFERENCE
    // =========================

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    // =========================
    // SENDER
    // =========================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // MESSAGE TYPE
    // =========================

    type: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "gif",
        "sticker",
      ],
      required: true,
      default: "text",
    },

    // =========================
    // MESSAGE CONTENT
    // =========================

    content: {
      type: String,
      trim: true,
      default: null,
    },

    // =========================
    // ATTACHMENT
    // =========================

    attachment: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
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

      mimeType: {
        type: String,
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
    // REPLY TO MESSAGE
    // =========================

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // =========================
    // FORWARDED MESSAGE
    // =========================

    isForwarded: {
      type: Boolean,
      default: false,
    },

    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // =========================
    // MESSAGE STATUS
    // =========================

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // =========================
    // REACTIONS
    // =========================

    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        emoji: {
          type: String,
          required: true,
          trim: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =========================
    // EDIT / DELETE
    // =========================

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =========================
    // STARRED MESSAGE
    // =========================

    starredBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

messageSchema.index({
  chat: 1,
  createdAt: -1,
});

messageSchema.index({
  sender: 1,
  createdAt: -1,
});

messageSchema.index({
  "reactions.user": 1,
});

const Message = mongoose.model("Message", messageSchema);

export default Message; 