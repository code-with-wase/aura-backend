// =====================================================
// CHAT SOCKET
// =====================================================

export const registerChatSocket = (
  socket,
  io
) => {
  // ===================================================
  // JOIN CHAT
  // ===================================================

  socket.on("chat:join", (data, callback) => {
    try {
      const { chatId } = data || {};

      if (!chatId) {
        throw new Error("Chat ID is required");
      }

      const room = `chat:${chatId}`;

      socket.join(room);

      socket.emit("chat:joined", {
        chatId,
      });

      if (typeof callback === "function") {
        callback({
          success: true,
          chatId,
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
  // LEAVE CHAT
  // ===================================================

  socket.on("chat:leave", (data, callback) => {
    try {
      const { chatId } = data || {};

      if (!chatId) {
        throw new Error("Chat ID is required");
      }

      socket.leave(`chat:${chatId}`);

      socket.emit("chat:left", {
        chatId,
      });

      if (typeof callback === "function") {
        callback({
          success: true,
          chatId,
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
  // CHAT EVENT
  // ===================================================

  socket.on("chat:event", (data) => {
    try {
      const { chatId, event, payload } =
        data || {};

      if (!chatId || !event) return;

      io.to(`chat:${chatId}`).emit(
        `chat:${event}`,
        payload
      );
    } catch (error) {
      console.error(
        `[CHAT SOCKET] ${error.message}`
      );
    }
  });
};  