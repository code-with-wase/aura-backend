import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("Cloudinary configured successfully");
  } catch (error) {
    console.error(`Cloudinary configuration failed: ${error.message}`);
    throw error;
  }
};

export default connectCloudinary;
export { cloudinary };