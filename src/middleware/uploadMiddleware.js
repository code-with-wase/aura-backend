import multer from "multer";
import { errorResponse } from "../utils/response.js";

// =========================
// MEMORY STORAGE
// =========================

const storage = multer.memoryStorage();

// =========================
// ALLOWED FILE TYPES
// =========================

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

// =========================
// FILE FILTER
// =========================

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE"),
      false
    );
  }

  callback(null, true);
};

// =========================
// MULTER CONFIGURATION
// =========================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 10,
  },
});

// =========================
// SINGLE FILE UPLOAD
// =========================

export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return errorResponse(
            res,
            400,
            "File size cannot exceed 50 MB"
          );
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return errorResponse(
            res,
            400,
            "This file type is not supported"
          );
        }

        return errorResponse(
          res,
          400,
          error.message
        );
      }

      if (error) {
        return next(error);
      }

      next();
    });
  };
};

// =========================
// MULTIPLE FILE UPLOAD
// =========================

export const uploadMultiple = (
  fieldName,
  maxCount = 10
) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(
      req,
      res,
      (error) => {
        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            return errorResponse(
              res,
              400,
              "File size cannot exceed 50 MB"
            );
          }

          if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return errorResponse(
              res,
              400,
              "This file type is not supported"
            );
          }

          return errorResponse(
            res,
            400,
            error.message
          );
        }

        if (error) {
          return next(error);
        }

        next();
      }
    );
  };
};

// =========================
// OPTIONAL FILE UPLOAD
// =========================

export const uploadOptional = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return errorResponse(
            res,
            400,
            "File size cannot exceed 50 MB"
          );
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return errorResponse(
            res,
            400,
            "This file type is not supported"
          );
        }

        return errorResponse(
          res,
          400,
          error.message
        );
      }

      if (error) {
        return next(error);
      }

      next();
    });
  };
};