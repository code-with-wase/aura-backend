import { cloudinary } from "../config/cloudinary.js";
import streamifier from "streamifier";

// =====================================================
// UPLOAD BUFFER TO CLOUDINARY
// =====================================================

const uploadBufferToCloudinary = (
  buffer,
  {
    folder = "aura-connect",
    resourceType = "auto",
  } = {}
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    streamifier
      .createReadStream(buffer)
      .pipe(uploadStream);
  });
};

// =====================================================
// DELETE FILE FROM CLOUDINARY
// =====================================================

export const deleteFile = async ({
  publicId,
  resourceType = "image",
}) => {
  if (!publicId) {
    throw new Error("Cloudinary public ID is required");
  }

  const result = await cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: resourceType,
    }
  );

  if (
    result.result !== "ok" &&
    result.result !== "not found"
  ) {
    throw new Error(
      "Failed to delete file from Cloudinary"
    );
  }

  return result;
};

// =====================================================
// UPLOAD SINGLE FILE
// =====================================================

export const uploadFile = async ({
  file,
  folder = "aura-connect",
  resourceType = "auto",
}) => {
  if (!file) {
    throw new Error("File is required");
  }

  if (!file.buffer) {
    throw new Error("Invalid uploaded file");
  }

  const result = await uploadBufferToCloudinary(
    file.buffer,
    {
      folder,
      resourceType,
    }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format || null,
    width: result.width || null,
    height: result.height || null,
    bytes: result.bytes || file.size || null,
    duration: result.duration || null,
    originalName: file.originalname || null,
    mimeType: file.mimetype || null,
  };
};

// =====================================================
// UPLOAD MULTIPLE FILES
// =====================================================

export const uploadFiles = async ({
  files,
  folder = "aura-connect",
  resourceType = "auto",
}) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("At least one file is required");
  }

  const uploadedFiles = await Promise.all(
    files.map((file) =>
      uploadFile({
        file,
        folder,
        resourceType,
      })
    )
  );

  return uploadedFiles;
};   