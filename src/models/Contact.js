import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    // =========================
    // CONTACT OWNER
    // =========================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // CONTACT USER
    // =========================

    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // BLOCK STATUS
    // =========================

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Same owner + same contact should exist only once
contactSchema.index(
  {
    owner: 1,
    contact: 1,
  },
  {
    unique: true,
  }
);

// Fast contact lookup
contactSchema.index({
  owner: 1,
  createdAt: -1,
});

// Fast blocked-user lookup
contactSchema.index({
  owner: 1,
  isBlocked: 1,
  createdAt: -1,
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;   