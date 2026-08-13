import jwt from "jsonwebtoken";

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

import {
  hashPassword,
  comparePassword,
} from "../utils/passwordUtils.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import {
  normalizePhone,
} from "../utils/normalizePhone.js";


// =========================
// REGISTER USER
// =========================

export const registerUser = async ({
  name,
  username,
  email,
  phone,
  password,
}) => {

  // =========================
  // NORMALIZE DATA
  // =========================

  const normalizedUsername =
    username.trim().toLowerCase();

  const normalizedEmail =
    email.trim().toLowerCase();

  const normalizedPhone =
    phone.trim();

  // =========================
  // NORMALIZE PHONE FOR
  // CONTACT MATCHING
  // =========================

  const normalizedPhoneNumber =
    normalizePhone(normalizedPhone);

  if (!normalizedPhoneNumber) {
    throw new Error(
      "Valid phone number is required"
    );
  }


  // =========================
  // CHECK USERNAME
  // =========================

  const existingUsername = await User.findOne({
    username: normalizedUsername,
  });

  if (existingUsername) {
    throw new Error(
      "Username is already registered"
    );
  }


  // =========================
  // CHECK EMAIL
  // =========================

  const existingEmail = await User.findOne({
    email: normalizedEmail,
  });

  if (existingEmail) {
    throw new Error(
      "Email is already registered"
    );
  }


  // =========================
  // CHECK PHONE
  // =========================

  const existingPhone = await User.findOne({
    phone: normalizedPhone,
  });

  if (existingPhone) {
    throw new Error(
      "Phone number is already registered"
    );
  }


  // =========================
  // CHECK NORMALIZED PHONE
  // =========================
  //
  // This prevents the same Indian number
  // from being registered in different formats.
  //
  // Example:
  // +91 98765 43210
  // 919876543210
  // 9876543210
  //
  // All become:
  // 919876543210

  const existingNormalizedPhone =
    await User.findOne({
      phoneNormalized:
        normalizedPhoneNumber,
    });

  if (existingNormalizedPhone) {
    throw new Error(
      "Phone number is already registered"
    );
  }


  // =========================
  // HASH PASSWORD
  // =========================

  const hashedPassword =
    await hashPassword(password);


  // =========================
  // CREATE USER
  // =========================

  const user = await User.create({
    name,
    username: normalizedUsername,
    email: normalizedEmail,
    phone: normalizedPhone,

    // Used by WhatsApp-style
    // phone contact matching.
    phoneNormalized:
      normalizedPhoneNumber,

    password: hashedPassword,
  });


  return user;
};


// =========================
// LOGIN USER
// =========================

export const loginUser = async ({
  identifier,
  password,
  userAgent = null,
  ipAddress = null,
}) => {

  const normalizedIdentifier =
    identifier.trim().toLowerCase();


  // =========================
  // FIND USER
  // =========================

  const user = await User.findOne({
    $or: [
      {
        email: normalizedIdentifier,
      },
      {
        username: normalizedIdentifier,
      },
      {
        phone: identifier.trim(),
      },
    ],
  }).select("+password");


  if (!user) {
    throw new Error("Invalid credentials");
  }


  // =========================
  // CHECK ACCOUNT STATUS
  // =========================

  if (!user.isActive) {
    throw new Error(
      "Your account is inactive"
    );
  }


  // =========================
  // CHECK PASSWORD
  // =========================

  const isPasswordValid =
    await comparePassword(
      password,
      user.password
    );


  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }


  // =========================
  // GENERATE TOKENS
  // =========================

  const accessToken =
    generateAccessToken(user._id);

  const refreshToken =
    generateRefreshToken(user._id);


  // =========================
  // STORE REFRESH TOKEN
  // =========================

  await RefreshToken.create({
    user: user._id,

    token: refreshToken,

    expiresAt: new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    ),

    isRevoked: false,

    revokedAt: null,

    userAgent,

    ipAddress,
  });


  // =========================
  // REMOVE PASSWORD
  // =========================

  user.password = undefined;


  return {
    user,
    accessToken,
    refreshToken,
  };
};


// =========================
// REFRESH ACCESS TOKEN
// =========================

export const refreshAccessToken = async (
  token
) => {

  if (!token) {
    throw new Error(
      "Refresh token is required"
    );
  }


  // =========================
  // FIND STORED TOKEN
  // =========================

  const storedToken =
    await RefreshToken.findOne({
      token,
    }).select("+token");


  if (!storedToken) {
    throw new Error(
      "Invalid refresh token"
    );
  }


  // =========================
  // CHECK REVOCATION
  // =========================

  if (storedToken.isRevoked) {
    throw new Error(
      "Refresh token has been revoked"
    );
  }


  // =========================
  // CHECK EXPIRATION
  // =========================

  if (
    storedToken.expiresAt <= new Date()
  ) {

    await RefreshToken.findByIdAndUpdate(
      storedToken._id,
      {
        isRevoked: true,
        revokedAt: new Date(),
      }
    );

    throw new Error(
      "Refresh token has expired"
    );
  }


  // =========================
  // VERIFY JWT
  // =========================

  let decoded;

  try {

    decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

  } catch (error) {

    await RefreshToken.findByIdAndUpdate(
      storedToken._id,
      {
        isRevoked: true,
        revokedAt: new Date(),
      }
    );

    throw new Error(
      "Refresh token is invalid or expired"
    );
  }


  // =========================
  // CHECK USER
  // =========================

  const user = await User.findById(
    decoded.userId
  ).select(
    "_id isActive"
  );


  if (!user) {
    throw new Error(
      "User account not found"
    );
  }


  if (!user.isActive) {
    throw new Error(
      "Your account is inactive"
    );
  }


  // =========================
  // GENERATE NEW ACCESS TOKEN
  // =========================

  const accessToken =
    generateAccessToken(
      decoded.userId
    );


  return {
    accessToken,
  };
};


// =========================
// LOGOUT USER
// =========================

export const logoutUser = async (
  token
) => {

  if (!token) {
    throw new Error(
      "Refresh token is required"
    );
  }


  // =========================
  // REVOKE TOKEN
  // =========================

  await RefreshToken.findOneAndUpdate(
    {
      token,
      isRevoked: false,
    },
    {
      isRevoked: true,
      revokedAt: new Date(),
    }
  );


  return true;
};  