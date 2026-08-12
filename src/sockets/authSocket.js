import jwt from "jsonwebtoken";

// =====================================================
// AUTHENTICATE SOCKET
// =====================================================

export const authenticateSocket = (socket) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(
        /^Bearer\s+/i,
        ""
      );

    if (!token) {
      throw new Error("Socket authentication token is required");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    if (!decoded?.userId) {
      throw new Error("Invalid socket authentication token");
    }

    socket.userId = decoded.userId;

    socket.user = {
      _id: decoded.userId,
    };

    return true;
  } catch (error) {
    console.error(
      `[SOCKET AUTH] ${error.message}`
    );

    return false;
  }
};

// =====================================================
// AUTH SOCKET EVENTS
// =====================================================

export const registerAuthSocket = (socket) => {
  socket.on("auth:check", (callback) => {
    if (typeof callback === "function") {
      callback({
        success: true,
        authenticated: Boolean(socket.userId),
        userId: socket.userId || null,
      });
    }
  });
}; 