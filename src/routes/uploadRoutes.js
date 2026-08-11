import express from "express";

import {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
} from "../controllers/uploadController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  uploadSingle,
  uploadMultiple,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

// =====================================================
// ALL UPLOAD ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authMiddleware);

// =====================================================
// UPLOAD SINGLE FILE
// POST /upload/single
// =====================================================

router.post(
  "/single",
  uploadSingle("file"),
  uploadFile
);

// =====================================================
// UPLOAD MULTIPLE FILES
// POST /upload/multiple
// =====================================================

router.post(
  "/multiple",
  uploadMultiple("files", 10),
  uploadMultipleFiles
);

// =====================================================
// DELETE CLOUDINARY FILE
// DELETE /upload
// =====================================================

router.delete(
  "/",
  deleteFile
);

export default router;  