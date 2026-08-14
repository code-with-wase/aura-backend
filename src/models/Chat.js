import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    // =========================
    // CHAT TYPE
    // =========================

    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },

    // =========================
    // CHAT PARTICIPANTS
    // =========================

    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        // =========================
        // PARTICIPANT SETTINGS
        // =========================

        isAdmin: {
          type: Boolean,
          default: false,
        },

        isMuted: {
          type: Boolean,
          default: false,
        },

        isArchived: {
          type: Boolean,
          default: false,
        },

        isPinned: {
          type: Boolean,
          default: false,
        },

        // =========================
        // UNREAD MESSAGES
        // =========================

        unreadCount: {
          type: Number,
          default: 0,
          min: 0,
        },

        // =========================
        // CHAT ACTIVITY
        // =========================

        lastReadAt: {
          type: Date,
          default: null,
        },

        joinedAt: {
          type: Date,
          default: Date.now,
        },

        leftAt: {
          type: Date,
          default: null,
        },
      },
    ],

    // =========================
    // LAST MESSAGE
    // =========================

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    lastMessageAt: { 
      type: Date,
      default: null,
    },

    // =========================
    // GROUP REFERENCE
    // =========================

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    // =========================
    // CHAT STATUS
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

chatSchema.index({ "participants.user": 1 });

chatSchema.index({ lastMessageAt: -1 });

chatSchema.index({ type: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;