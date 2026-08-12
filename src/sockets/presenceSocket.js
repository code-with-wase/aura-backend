import User from "../models/User.js";

// =====================================================
// ONLINE USER
// =====================================================

export const registerPresenceSocket = (
  socket,
  io
) => {
  socket.on("presence:online", async () => {
    try {
      if (!socket.userId) return;

      await User.findByIdAndUpdate(
        socket.userId,
        {
          isOnline: true,
        }
      );

      io.emit("presence:updated", {
        userId: socket.userId,
        isOnline: true,
        lastSeen: null,
      });
    } catch (error) {
      console.error(
        `[PRESENCE] Online error: ${error.message}`
      );
    }
  });

  // ===================================================
  // MANUAL OFFLINE
  // ===================================================

  socket.on("presence:offline", async () => {
    try {
      if (!socket.userId) return;

      const lastSeen = new Date();

      await User.findByIdAndUpdate(
        socket.userId,
        {
          isOnline: false,
          lastSeen,
        }
      );

      io.emit("presence:updated", {
        userId: socket.userId,
        isOnline: false,
        lastSeen,
      });
    } catch (error) {
      console.error(
        `[PRESENCE] Offline error: ${error.message}`
      );
    }
  });
};

// =====================================================
// HANDLE DISCONNECT PRESENCE
// =====================================================

export const handlePresenceDisconnect = async (
  socket,
  io
) => {
  try {
    if (!socket.userId) return;

    const lastSeen = new Date();

    await User.findByIdAndUpdate(
      socket.userId,
      {
        isOnline: false,
        lastSeen,
      }
    );

    io.emit("presence:updated", {
      userId: socket.userId,
      isOnline: false,
      lastSeen,
    });
  } catch (error) {
    console.error(
      `[PRESENCE] Disconnect error: ${error.message}`
    );
  }
};  