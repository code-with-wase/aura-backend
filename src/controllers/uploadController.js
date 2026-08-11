import {
  uploadFile as uploadFileService,
  uploadFiles as uploadFilesService,
  deleteFile as deleteFileService,
} from "../services/uploadService.js";

import {
  successResponse,
} from "../utils/response.js";

// =====================================================
// UPLOAD SINGLE FILE
// =====================================================

export const uploadFile = async (
  req,
  res,
  next
) => {
  try {
    if (!req.file) {
      throw new Error("File is required");
    }

    const result =
      await uploadFileService({
        file: req.file,
        folder:
          req.body?.folder ||
          "aura-connect",
        resourceType:
          req.body?.resourceType ||
          "auto",
      });

    return successResponse(
      res,
      200,
      "File uploaded successfully",
      {
        file: result,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// UPLOAD MULTIPLE FILES
// =====================================================

export const uploadMultipleFiles = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.files ||
      !Array.isArray(req.files) ||
      req.files.length === 0
    ) {
      throw new Error(
        "At least one file is required"
      );
    }

    const result =
      await uploadFilesService({
        files: req.files,
        folder:
          req.body?.folder ||
          "aura-connect",
        resourceType:
          req.body?.resourceType ||
          "auto",
      });

    return successResponse(
      res,
      200,
      "Files uploaded successfully",
      {
        files: result,
        count: result.length,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// DELETE FILE
// =====================================================

export const deleteFile = async (
  req,
  res,
  next
) => {
  try {
    const {
      publicId,
      resourceType = "image",
    } = req.body;

    if (!publicId) {
      throw new Error(
        "Cloudinary public ID is required"
      );
    }

    const result =
      await deleteFileService({
        publicId,
        resourceType,
      });

    return successResponse(
      res,
      200,
      "File deleted successfully",
      {
        result,
      }
    );
  } catch (error) {
    return next(error);
  }
};  