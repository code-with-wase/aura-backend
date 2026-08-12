// =====================================================
// CALL SOCKET
// =====================================================

export const registerCallSocket = (
  socket,
  io
) => {
  // ===================================================
  // CALL ROOM JOIN
  // ===================================================

  socket.on("call:join", (data, callback) => {
    try {
      const { callId } = data || {};

      if (!callId) {
        throw new Error("Call ID is required");
      }

      socket.join(`call:${callId}`);

      socket.to(`call:${callId}`).emit(
        "call:participant-joined",
        {
          callId,
          userId: socket.userId,
        }
      );

      if (typeof callback === "function") {
        callback({
          success: true,
          callId,
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
  // CALL OFFER
  // ===================================================

  socket.on("call:offer", (data) => {
    const {
      callId,
      offer,
      targetUserId,
    } = data || {};

    if (!callId || !offer) return;

    if (targetUserId) {
      io.to(`user:${targetUserId}`).emit(
        "call:offer",
        {
          callId,
          offer,
          fromUserId: socket.userId,
        }
      );

      return;
    }

    socket.to(`call:${callId}`).emit(
      "call:offer",
      {
        callId,
        offer,
        fromUserId: socket.userId,
      }
    );
  });

  // ===================================================
  // CALL ANSWER
  // ===================================================

  socket.on("call:answer", (data) => {
    const {
      callId,
      answer,
      targetUserId,
    } = data || {};

    if (!callId || !answer) return;

    if (targetUserId) {
      io.to(`user:${targetUserId}`).emit(
        "call:answer",
        {
          callId,
          answer,
          fromUserId: socket.userId,
        }
      );

      return;
    }

    socket.to(`call:${callId}`).emit(
      "call:answer",
      {
        callId,
        answer,
        fromUserId: socket.userId,
      }
    );
  });

  // ===================================================
  // ICE CANDIDATE
  // ===================================================

  socket.on("call:ice-candidate", (data) => {
    const {
      callId,
      candidate,
      targetUserId,
    } = data || {};

    if (!callId || !candidate) return;

    if (targetUserId) {
      io.to(`user:${targetUserId}`).emit(
        "call:ice-candidate",
        {
          callId,
          candidate,
          fromUserId: socket.userId,
        }
      );

      return;
    }

    socket.to(`call:${callId}`).emit(
      "call:ice-candidate",
      {
        callId,
        candidate,
        fromUserId: socket.userId,
      }
    );
  });

  // ===================================================
  // CALL END
  // ===================================================

  socket.on("call:end", (data) => {
    const { callId } = data || {};

    if (!callId) return;

    io.to(`call:${callId}`).emit(
      "call:ended",
      {
        callId,
        userId: socket.userId,
      }
    );
  });

  // ===================================================
  // CALL REJECT
  // ===================================================

  socket.on("call:reject", (data) => {
    const {
      callId,
      targetUserId,
    } = data || {};

    if (!callId) return;

    const payload = {
      callId,
      userId: socket.userId,
    };

    if (targetUserId) {
      io.to(`user:${targetUserId}`).emit(
        "call:rejected",
        payload
      );
    } else {
      socket.to(`call:${callId}`).emit(
        "call:rejected",
        payload
      );
    }
  });

  // ===================================================
  // CALL LEAVE
  // ===================================================

  socket.on("call:leave", (data) => {
    const { callId } = data || {};

    if (!callId) return;

    socket.leave(`call:${callId}`);

    socket.to(`call:${callId}`).emit(
      "call:participant-left",
      {
        callId,
        userId: socket.userId,
      }
    );
  });
};  