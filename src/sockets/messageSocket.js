// =====================================================
// MESSAGE SOCKET
// =====================================================

export const registerMessageSocket = (
  socket,
  io
) => {
  // ===================================================
  // SEND MESSAGE EVENT
  // ===================================================

  socket.on("message:send", (data, callback) => {
    try {
      const {
        chatId,
        message,
      } = data || {};

      if (!chatId) {
        throw new Error("Chat ID is required");
      }

      if (!message) {
        throw new Error("Message data is required");
      }

      io.to(`chat:${chatId}`).emit(
        "message:new",
        {
          chatId,
          message,
        }
      );

      if (typeof callback === "function") {
        callback({
          success: true,
        });
      }
    } catch (error) {
      if (typeof callback === "function") {
        callback({
          success: false,
          message: error.message,
        });
      }
    }
  });

  // ===================================================
  // MESSAGE DELIVERED
  // ===================================================

  socket.on(
    "message:delivered",
    (data) => {
      const {
        chatId,
        messageId,
        userId,
      } = data || {};

      if (!chatId || !messageId) return;

      io.to(`chat:${chatId}`).emit(
        "message:delivered",
        {
          chatId,
          messageId,
          userId:
            userId || socket.userId,
        }
      );
    }
  );

  // ===================================================
  // MESSAGE READ
  // ===================================================

  socket.on(
    "message:read",
    (data) => {
      const {
        chatId,
        messageId,
      } = data || {};

      if (!chatId || !messageId) return;

      io.to(`chat:${chatId}`).emit(
        "message:read",
        {
          chatId,
          messageId,
          userId: socket.userId,
        }
      );
    }
  );

  // ===================================================
  // MESSAGE DELETED
  // ===================================================

  socket.on(
    "message:deleted",
    (data) => {
      const {
        chatId,
        messageId,
      } = data || {};

      if (!chatId || !messageId) return;

      io.to(`chat:${chatId}`).emit(
        "message:deleted",
        {
          chatId,
          messageId,
          userId: socket.userId,
        }
      );
    }
  );

  // ===================================================
  // MESSAGE EDITED
  // ===================================================

  socket.on(
    "message:edited",
    (data) => {
      const {
        chatId,
        message,
      } = data || {};

      if (!chatId || !message) return;

      io.to(`chat:${chatId}`).emit(
        "message:edited",
        {
          chatId,
          message,
          userId: socket.userId,
        }
      );
    }
  );
};  