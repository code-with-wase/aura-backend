import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC GROUP INFORMATION
    // =========================

    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      minlength: [2, "Group name must be at least 2 characters"],
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Group description cannot exceed 500 characters"],
      default: null,
    },

    avatar: {
      type: String,
      default: null,
    },

    avatarPublicId: {
      type: String,
      default: null,
    },

    // =========================
    // GROUP CREATOR
    // =========================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // GROUP MEMBERS
    // =========================

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },

        joinedAt: {
          type: Date,
          default: Date.now,
        },

        leftAt: {
          type: Date,
          default: null,
        },

        isMuted: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // =========================
    // GROUP SETTINGS
    // =========================

    settings: {
      onlyAdminsCanSendMessages: {
        type: Boolean,
        default: false,
      },

      onlyAdminsCanEditInfo: {
        type: Boolean,
        default: true,
      },

      onlyAdminsCanAddMembers: {
        type: Boolean,
        default: false,
      },

      onlyAdminsCanRemoveMembers: {
        type: Boolean,
        default: true,
      },
    },

    // =========================
    // GROUP STATUS
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

groupSchema.index({
  "members.user": 1,
});

groupSchema.index({
  createdBy: 1,
});

groupSchema.index({
  isActive: 1,
});

const Group = mongoose.model("Group", groupSchema);

export default Group;