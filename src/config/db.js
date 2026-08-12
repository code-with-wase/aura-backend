import mongoose from "mongoose";

// =====================================================
// MONGODB CONNECTION CACHE
// =====================================================

let cachedConnection = null;

// =====================================================
// CONNECT DATABASE
// =====================================================

const connectDB = async () => {
  try {
    // -------------------------------------------------
    // VALIDATE MONGO_URI
    // -------------------------------------------------

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI environment variable is not defined"
      );
    }

    // -------------------------------------------------
    // REUSE EXISTING CONNECTION
    // -------------------------------------------------

    if (cachedConnection) {
      return cachedConnection;
    }

    // -------------------------------------------------
    // REUSE MONGOOSE GLOBAL CONNECTION
    // -------------------------------------------------

    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    // -------------------------------------------------
    // CREATE NEW CONNECTION
    // -------------------------------------------------

    const connection = await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 0,
      }
    );

    cachedConnection = connection.connection;

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );

    return cachedConnection;
  } catch (error) {
    console.error(
      `MongoDB connection failed: ${error.message}`
    );

    throw error;
  }
};

export default connectDB;  