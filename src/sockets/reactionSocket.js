// =====================================================
// REACTION SOCKET
// =====================================================

export const registerReactionSocket = (
  socket,
  io
) => {
  // ===================================================
  // ADD REACTION
  // ===================================================

  socket.on("reaction:add", (data) => {
    const {
      chatId,
      messageId,
      reaction,
    } = data || {};

    if (
      !chatId ||
      !messageId ||
      !reaction
    ) {
      return;
    }

    io.to(`chat:${chatId}`).emit(
      "reaction:added",
      {
        chatId,
        messageId,
        reaction,
        userId: socket.userId,
      }
    );
  });

  // ===================================================
  // REMOVE REACTION
  // ===================================================

  socket.on("reaction:remove", (data) => {
    const {
      chatId,
      messageId,
      reaction,
    } = data || {};

    if (
      !chatId ||
      !messageId
    ) {
      return;
    }

    io.to(`chat:${chatId}`).emit(
      "reaction:removed",
      {
        chatId,
        messageId,
        reaction: reaction || null,
        userId: socket.userId,
      }
    );
  });
}; 