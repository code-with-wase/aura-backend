import User from "../models/User.js";

// =====================================================
// ACTIVE SOCKET TRACKING
// =====================================================
//
// Keeps track of how many active Socket.IO connections
// each user currently has.
//
// This prevents a user from being marked offline when:
// - one browser tab closes
// - another tab is still open
// - mobile + desktop are both connected
//
// Structure:
//
// userId -> Set(socketId)
// =====================================================

const activeUserSockets = new Map();

// =====================================================
// ADD SOCKET FOR USER
// =====================================================

const addUserSocket = (
  userId,
  socketId
) => {
  if (!userId || !socketId) return;

  let sockets =
    activeUserSockets.get(
      String(userId)
    );

  if (!sockets) {
    sockets = new Set();

    activeUserSockets.set(
      String(userId),
      sockets
    );
  }

  sockets.add(socketId);
};

// =====================================================
// REMOVE SOCKET FOR USER
// =====================================================

const removeUserSocket = (
  userId,
  socketId
) => {
  if (!userId || !socketId) {
    return 0;
  }

  const userKey = String(userId);

  const sockets =
    activeUserSockets.get(userKey);

  if (!sockets) {
    return 0;
  }

  sockets.delete(socketId);

  // No active sockets remain.
  if (sockets.size === 0) {
    activeUserSockets.delete(userKey);

    return 0;
  }

  return sockets.size;
};

// =====================================================
// GET ACTIVE SOCKET COUNT
// =====================================================

const getActiveSocketCount = (
  userId
) => {
  if (!userId) return 0;

  const sockets =
    activeUserSockets.get(
      String(userId)
    );

  return sockets
    ? sockets.size
    : 0;
};

// =====================================================
// MARK USER ONLINE
// =====================================================

const markUserOnline = async (
  userId,
  io
) => {
  if (!userId) return null;

  const user =
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isOnline: true,
        },
      },
      {
        new: true,
      }
    ).select(
      "_id isOnline lastSeen"
    );

  if (!user) {
    return null;
  }

  // ---------------------------------------------------
  // Do NOT reset lastSeen when user comes online.
  //
  // lastSeen represents the previous offline time.
  // ---------------------------------------------------

  io.emit("presence:updated", {
    userId: String(user._id),
    isOnline: true,
    lastSeen: user.lastSeen || null,
  });

  return user;
};

// =====================================================
// MARK USER OFFLINE
// =====================================================

const markUserOffline = async (
  userId,
  io
) => {
  if (!userId) return null;

  // ---------------------------------------------------
  // Safety check:
  // If another socket is still connected, user remains
  // online.
  // ---------------------------------------------------

  const activeSockets =
    getActiveSocketCount(userId);

  if (activeSockets > 0) {
    return null;
  }

  const lastSeen = new Date();

  const user =
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isOnline: false,
          lastSeen,
        },
      },
      {
        new: true,
      }
    ).select(
      "_id isOnline lastSeen"
    );

  if (!user) {
    return null;
  }

  io.emit("presence:updated", {
    userId: String(user._id),
    isOnline: false,
    lastSeen: user.lastSeen,
  });

  return user;
};

// =====================================================
// ONLINE USER
// =====================================================

export const registerPresenceSocket = (
  socket,
  io
) => {
  // ===================================================
  // REGISTER CURRENT SOCKET
  // ===================================================

  if (socket.userId) {
    addUserSocket(
      socket.userId,
      socket.id
    );

    // Automatically mark user online when the
    // authenticated socket connects.
    markUserOnline(
      socket.userId,
      io
    ).catch((error) => {
      console.error(
        `[PRESENCE] Automatic online error: ${error.message}`
      );
    });
  }

  // ===================================================
  // MANUAL ONLINE
  // ===================================================

  socket.on(
    "presence:online",
    async () => {
      try {
        if (!socket.userId) return;

        addUserSocket(
          socket.userId,
          socket.id
        );

        const user =
          await markUserOnline(
            socket.userId,
            io
          );

        if (!user) {
          console.error(
            "[PRESENCE] User not found while going online"
          );
        }
      } catch (error) {
        console.error(
          `[PRESENCE] Online error: ${error.message}`
        );
      }
    }
  );

  // ===================================================
  // MANUAL OFFLINE
  // ===================================================

  socket.on(
    "presence:offline",
    async () => {
      try {
        if (!socket.userId) return;

        // Remove only this socket.
        const remainingSockets =
          removeUserSocket(
            socket.userId,
            socket.id
          );

        // If another device/tab is connected,
        // don't mark the user offline.
        if (remainingSockets > 0) {
          return;
        }

        await markUserOffline(
          socket.userId,
          io
        );
      } catch (error) {
        console.error(
          `[PRESENCE] Offline error: ${error.message}`
        );
      }
    }
  );
};

// =====================================================
// HANDLE DISCONNECT PRESENCE
// =====================================================

export const handlePresenceDisconnect =
  async (
    socket,
    io
  ) => {
    try {
      if (!socket.userId) return;

      // -------------------------------------------------
      // Remove disconnected socket.
      // -------------------------------------------------

      const remainingSockets =
        removeUserSocket(
          socket.userId,
          socket.id
        );

      // -------------------------------------------------
      // Another socket is still connected.
      //
      // Example:
      // Desktop connected
      // Mobile connected
      // Desktop disconnects
      //
      // User must remain online.
      // -------------------------------------------------

      if (remainingSockets > 0) {
        return;
      }

      // -------------------------------------------------
      // No active sockets remain.
      // User is actually offline.
      // -------------------------------------------------

      await markUserOffline(
        socket.userId,
        io
      );
    } catch (error) {
      console.error(
        `[PRESENCE] Disconnect error: ${error.message}`
      );
    }
  }; 