import { Server } from "socket.io";

import {
  authenticateSocket,
  registerAuthSocket,
} from "./authSocket.js";

import {
  registerPresenceSocket,
  handlePresenceDisconnect,
} from "./presenceSocket.js";

import {
  registerChatSocket,
} from "./chatSocket.js";

import {
  registerMessageSocket,
} from "./messageSocket.js";

import {
  registerTypingSocket,
} from "./typingSocket.js";

import {
  registerReactionSocket,
} from "./reactionSocket.js";

import {
  registerGroupSocket,
} from "./groupSocket.js";

import {
  registerCallSocket,
} from "./callSocket.js";

// =====================================================
// SOCKET.IO INSTANCE
// =====================================================

let io = null;

// =====================================================
// INITIALIZE SOCKET SERVER
// =====================================================

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
      ],
    },
  });

  // ===================================================
  // CONNECTION
  // ===================================================

  io.on("connection", async (socket) => {
    console.log(
      `[SOCKET] Client connected: ${socket.id}`
    );

    // ================================================
    // AUTHENTICATION
    // ================================================

    const authenticated =
      authenticateSocket(socket);

    if (!authenticated) {
      socket.emit("auth:error", {
        success: false,
        message: "Socket authentication failed",
      });

      socket.disconnect(true);

      return;
    }

    console.log(
      `[SOCKET] Authenticated user: ${socket.userId}`
    );

    // ================================================
    // USER PERSONAL ROOM
    // ================================================

    socket.join(`user:${socket.userId}`);

    // ================================================
    // REGISTER SOCKET MODULES
    // ================================================

    registerAuthSocket(socket);

    registerPresenceSocket(
      socket,
      io
    );

    registerChatSocket(
      socket,
      io
    );

    registerMessageSocket(
      socket,
      io
    );

    registerTypingSocket(
      socket,
      io
    );

    registerReactionSocket(
      socket,
      io
    );

    registerGroupSocket(
      socket,
      io
    );

    registerCallSocket(
      socket,
      io
    );

    // ================================================
    // AUTOMATIC ONLINE STATUS
    // ================================================

    socket.emit("presence:connected", {
      userId: socket.userId,
      isOnline: true,
    });

    // ================================================
    // DISCONNECT
    // ================================================

    socket.on("disconnect", async (reason) => {
      console.log(
        `[SOCKET] Client disconnected: ${socket.id} - ${reason}`
      );

      await handlePresenceDisconnect(
        socket,
        io
      );
    });
  });

  console.log(
    "[SOCKET] Socket.IO initialized successfully"
  );

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