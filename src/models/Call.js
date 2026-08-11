import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    // =========================
    // CALL TYPE
    // =========================

    type: {
      type: String,
      enum: ["audio", "video"],
      required: true,
    },

    // =========================
    // CALL MODE
    // =========================

    mode: {
      type: String,
      enum: ["private", "group"],
      required: true,
      default: "private",
    },

    // =========================
    // CHAT REFERENCE
    // =========================

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    // =========================
    // CALL INITIATOR
    // =========================

    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // CALL PARTICIPANTS
    // =========================

    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        status: {
          type: String,
          enum: [
            "invited",
            "ringing",
            "joined",
            "declined",
            "missed",
            "left",
          ],
          default: "invited",
        },

        joinedAt: {
          type: Date,
          default: null,
        },

        leftAt: {
          type: Date,
          default: null,
        },
      },
    ],

    // =========================
    // CALL STATUS
    // =========================

    status: {
      type: String,
      enum: [
        "initiated",
        "ringing",
        "ongoing",
        "completed",
        "rejected",
        "missed",
        "cancelled",
      ],
      default: "initiated",
    },

    // =========================
    // CALL TIMING
    // =========================

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // CALL END INFORMATION
    // =========================

    endedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    endReason: {
      type: String,
      enum: [
        "completed",
        "rejected",
        "missed",
        "cancelled",
        "busy",
        "network_error",
      ],
      default: null,
    },

    // =========================
    // CALL RECORDING
    // =========================

    recording: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
        type: String,
        default: null,
      },

      duration: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

callSchema.index({
  chat: 1,
  createdAt: -1,
});

callSchema.index({
  caller: 1,
  createdAt: -1,
});

callSchema.index({
  "participants.user": 1,
  createdAt: -1,
});

callSchema.index({
  status: 1,
});

const Call = mongoose.model("Call", callSchema);

export default Call;

