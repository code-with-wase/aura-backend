import mongoose from "mongoose";
import { ZodError } from "zod";
import multer from "multer";
import { errorResponse } from "../utils/response.js";
import { logger } from "../utils/logger.js";

export const errorMiddleware = (error, req, res, next) => {
  logger.error("Unhandled application error", error);

  // =========================
  // RESPONSE ALREADY SENT
  // =========================

  if (res.headersSent) {
    return next(error);
  }

  // =========================
  // MONGOOSE VALIDATION ERROR
  // =========================

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return errorResponse(
      res,
      400,
      "Database validation failed",
      errors
    );
  }

  // =========================
  // MONGOOSE CAST ERROR
  // =========================

  if (error instanceof mongoose.Error.CastError) {
    return errorResponse(
      res,
      400,
      `Invalid value for ${error.path}`
    );
  }

  // =========================
  // MONGOOSE DUPLICATE KEY
  // =========================

  if (error.code === 11000) {
    const duplicateFields = Object.keys(
      error.keyPattern || {}
    );

    const errors = duplicateFields.map((field) => ({
      field,
      message: `${field} already exists`,
    }));

    return errorResponse(
      res,
      409,
      "Duplicate data",
      errors
    );
  }

  // =========================
  // ZOD VALIDATION ERROR
  // =========================

  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return errorResponse(
      res,
      400,
      "Request validation failed",
      errors
    );
  }

  // =========================
  // MULTER ERRORS
  // =========================

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return errorResponse(
        res,
        400,
        "File size cannot exceed the allowed limit"
      );
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return errorResponse(
        res,
        400,
        "Too many files uploaded"
      );
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return errorResponse(
        res,
        400,
        "Unexpected file uploaded"
      );
    }

    return errorResponse(
      res,
      400,
      error.message
    );
  }

  // =========================
  // JWT ERRORS
  // =========================

  if (error.name === "JsonWebTokenError") {
    return errorResponse(
      res,
      401,
      "Invalid authentication token"
    );
  }

  if (error.name === "TokenExpiredError") {
    return errorResponse(
      res,
      401,
      "Authentication token has expired"
    );
  }

  // =========================
  // DEFAULT ERROR
  // =========================

  const statusCode = error.statusCode || 500;

  const message =
    statusCode === 500
      ? "Internal server error"
      : error.message || "Something went wrong";

  return errorResponse(
    res,
    statusCode,
    message
  );
};