import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // =========================
        // BASIC USER INFORMATION
        // =========================
 
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },

        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"],
            match: [
                /^[a-zA-Z0-9._]+$/,
                "Username can only contain letters, numbers, dots and underscores",
            ],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
        },

        // =========================
        // NORMALIZED PHONE
        // =========================
        //
        // Used for reliable phone-contact matching.
        //
        // Example:
        // +91 98765 43210
        //       ↓
        // 919876543210

        phoneNormalized: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },

        // =========================
        // AUTHENTICATION
        // =========================

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },

        // =========================
        // PROFILE
        // =========================

        avatar: {
            type: String,
            default: null,
        },

        about: {
            type: String,
            trim: true,
            maxlength: [150, "About cannot exceed 150 characters"],
            default: "Hey there! I am using NexOra Connect.",
        },

        // =========================
        // PRESENCE
        // =========================

        isOnline: {
            type: Boolean,
            default: false,
        },

        lastSeen: {
            type: Date,
            default: null,
        },

        // =========================
        // ACCOUNT STATUS
        // =========================

        isVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        // =========================
        // PRIVACY SETTINGS
        // =========================

        privacy: {
            lastSeen: {
                type: String,
                enum: ["everyone", "contacts", "nobody"],
                default: "everyone",
            },

            profilePhoto: {
                type: String,
                enum: ["everyone", "contacts", "nobody"],
                default: "everyone",
            },

            about: {
                type: String,
                enum: ["everyone", "contacts", "nobody"],
                default: "everyone",
            },

            readReceipts: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User; 