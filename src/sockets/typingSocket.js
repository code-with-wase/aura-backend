// =====================================================
// TYPING SOCKET
// =====================================================

export const registerTypingSocket = (
  socket,
  io
) => {
  // ===================================================
  // TYPING START
  // ===================================================

  socket.on("typing:start", (data) => {
    const { chatId } = data || {};

    if (!chatId) return;

    socket.to(`chat:${chatId}`).emit(
      "typing:start",
      {
        chatId,
        userId: socket.userId,
      }
    );
  });

  // ===================================================
  // TYPING STOP
  // ===================================================

  socket.on("typing:stop", (data) => {
    const { chatId } = data || {};

    if (!chatId) return;

    socket.to(`chat:${chatId}`).emit(
      "typing:stop",
      {
        chatId,
        userId: socket.userId,
      }
    );
  });
};  