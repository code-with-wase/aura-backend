import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { errorResponse } from "../utils/response.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return errorResponse(
        res,
        401,
        "Authentication token is required"
      );
    }

    const tokenParts = authorizationHeader.split(" ");

    if (
      tokenParts.length !== 2 ||
      tokenParts[0] !== "Bearer"
    ) {
      return errorResponse(
        res,
        401,
        "Invalid authorization format"
      );
    }

    const token = tokenParts[1];

    if (!token) {
      return errorResponse(
        res,
        401,
        "Authentication token is required"
      );
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    const user = await User.findById(decodedToken.userId).select(
      "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy"
    );

    if (!user) {
      return errorResponse(
        res,
        401,
        "User account not found"
      );
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        403,
        "Your account is inactive"
      );
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        401,
        "Access token has expired"
      );
    }

    if (error.name === "JsonWebTokenError") {
      return errorResponse(
        res,
        401,
        "Invalid access token"
      );
    }

    return next(error);
  }
};