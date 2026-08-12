import { Server } from "socket.io";

// =====================================================
// INITIALIZE SOCKET.IO
// =====================================================

let io = null;

// =====================================================
// INITIALIZE SOCKET SERVER
// =====================================================

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  // ===================================================
  // CONNECTION
  // ===================================================

  io.on("connection", (socket) => {
    console.log(
      `[SOCKET] Client connected: ${socket.id}`
    );

    // ================================================
    // DISCONNECT
    // ================================================

    socket.on("disconnect", (reason) => {
      console.log(
        `[SOCKET] Client disconnected: ${socket.id} - ${reason}`
      );
    });
  });

  console.log("[SOCKET] Socket.IO initialized successfully");

  return io;
};

// =====================================================
// GET SOCKET.IO INSTANCE
// =====================================================

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return io;
};

export default initializeSocket; 