// =====================================================
// GROUP SOCKET
// =====================================================

export const registerGroupSocket = (
  socket,
  io
) => {
  // ===================================================
  // JOIN GROUP
  // ===================================================

  socket.on("group:join", (data, callback) => {
    try {
      const { groupId } = data || {};

      if (!groupId) {
        throw new Error("Group ID is required");
      }

      socket.join(`group:${groupId}`);

      socket.emit("group:joined", {
        groupId,
      });

      if (typeof callback === "function") {
        callback({
          success: true,
          groupId,
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
  // LEAVE GROUP
  // ===================================================

  socket.on("group:leave", (data, callback) => {
    try {
      const { groupId } = data || {};

      if (!groupId) {
        throw new Error("Group ID is required");
      }

      socket.leave(`group:${groupId}`);

      socket.emit("group:left", {
        groupId,
      });

      if (typeof callback === "function") {
        callback({
          success: true,
          groupId,
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
  // GROUP EVENT
  // ===================================================

  socket.on("group:event", (data) => {
    const {
      groupId,
      event,
      payload,
    } = data || {};

    if (!groupId || !event) return;

    io.to(`group:${groupId}`).emit(
      `group:${event}`,
      {
        ...payload,
        groupId,
      }
    );
  });
};  