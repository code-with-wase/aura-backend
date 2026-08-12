import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // =========================
    // NOTIFICATION RECIPIENT
    // =========================

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // NOTIFICATION SENDER
    // =========================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================
    // NOTIFICATION TYPE
    // =========================

    type: {
      type: String,
      enum: [
        "message",
        "reaction",
        "reply",
        "mention",
        "group_invite",
        "group_added",
        "group_removed",
        "group_admin",
        "call",
        "status",
        "system",
      ],
      required: true,
    },

    // =========================
    // NOTIFICATION CONTENT
    // =========================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // =========================
    // RELATED DOCUMENTS
    // =========================

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },

    messageRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    call: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Call",
      default: null,
    },

    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      default: null,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    // =========================
    // EXTRA DATA
    // =========================

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // =========================
    // READ STATE
    // =========================

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  sender: 1,
  createdAt: -1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
); 

export default Notification;