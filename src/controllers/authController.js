import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../services/authService.js";

import { successResponse } from "../utils/response.js";


// =========================
// REGISTER
// =========================

export const register = async (req, res, next) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      password,
    } = req.validatedData.body;

    const user = await registerUser({
      name,
      username,
      email,
      phone,
      password,
    });

    return successResponse(
      res,
      201,
      "Account created successfully",
      {
        user,
      }
    );
  } catch (error) {
    next(error);
  }
};


// =========================
// LOGIN
// =========================

export const login = async (req, res, next) => {
  try {
    const {
      identifier,
      password,
    } = req.validatedData.body;

    const result = await loginUser({
      identifier,
      password,
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip,
    });

    return successResponse(
      res,
      200,
      "Login successful",
      result
    );
  } catch (error) {
    next(error);
  }
};


// =========================
// REFRESH ACCESS TOKEN
// =========================

export const refreshToken = async (req, res, next) => {
  try {
    const token =
      req.body?.refreshToken ||
      req.cookies?.refreshToken;

    const result = await refreshAccessToken(token);

    return successResponse(
      res,
      200,
      "Access token refreshed successfully",
      result
    );
  } catch (error) {
    next(error);
  }
};


// =========================
// LOGOUT
// =========================

export const logout = async (req, res, next) => {
  try {
    const token =
      req.body?.refreshToken ||
      req.cookies?.refreshToken;

    await logoutUser(token);

    return successResponse(
      res,
      200,
      "Logout successful"
    );
  } catch (error) {
    next(error);
  }
};