import Chat from "../models/Chat.js";

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

  socket.on(
    "group:join",
    async (data, callback) => {
      try {
        const { groupId } =
          data || {};

        if (!groupId) {
          throw new Error(
            "Group ID is required"
          );
        }

        // =============================================
        // FIND GROUP CHAT
        // =============================================

        const chat =
          await Chat.findOne({
            type: "group",
            group: groupId,
            isActive: true,
            "participants.user":
              socket.userId,
            "participants.leftAt": null,
          }).select("_id");

        if (!chat) {
          throw new Error(
            "Group chat not found or you are not a member"
          );
        }

        // =============================================
        // JOIN GROUP ROOM
        // =============================================

        socket.join(
          `group:${groupId}`
        );

        // =============================================
        // JOIN ACTUAL CHAT ROOM
        // =============================================

        socket.join(
          `chat:${chat._id}`
        );

        socket.emit(
          "group:joined",
          {
            groupId,
            chatId: chat._id,
          }
        );

        if (
          typeof callback ===
          "function"
        ) {
          callback({
            success: true,
            groupId,
            chatId: chat._id,
          });
        }
      } catch (error) {
        if (
          typeof callback ===
          "function"
        ) {
          callback({
            success: false,
            message: error.message,
          });
        }
      }
    }
  );

  // ===================================================
  // LEAVE GROUP
  // ===================================================

  socket.on(
    "group:leave",
    async (data, callback) => {
      try {
        const { groupId } =
          data || {};

        if (!groupId) {
          throw new Error(
            "Group ID is required"
          );
        }

        const chat =
          await Chat.findOne({
            type: "group",
            group: groupId,
          }).select("_id");

        // Leave group room
        socket.leave(
          `group:${groupId}`
        );

        // Leave chat room
        if (chat) {
          socket.leave(
            `chat:${chat._id}`
          );
        }

        socket.emit(
          "group:left",
          {
            groupId,
            chatId:
              chat?._id || null,
          }
        );

        if (
          typeof callback ===
          "function"
        ) {
          callback({
            success: true,
            groupId,
            chatId:
              chat?._id || null,
          });
        }
      } catch (error) {
        if (
          typeof callback ===
          "function"
        ) {
          callback({
            success: false,
            message: error.message,
          });
        }
      }
    }
  );

  // ===================================================
  // GROUP EVENT
  // ===================================================

  socket.on(
    "group:event",
    (data) => {
      try {
        const {
          groupId,
          event,
          payload,
        } = data || {};

        if (
          !groupId ||
          !event
        ) {
          return;
        }

        io.to(
          `group:${groupId}`
        ).emit(
          `group:${event}`,
          {
            ...payload,
            groupId,
          }
        );
      } catch (error) {
        console.error(
          `[GROUP SOCKET] ${error.message}`
        );
      }
    }
  );
}; 