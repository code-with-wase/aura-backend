import {
  createPrivateChat,
  getUserChats,
  getChatById,
  updateChatSettings,
  markChatAsRead,
  leaveChat,
} from "../services/chatService.js";

import {
  successResponse,
} from "../utils/response.js";

// =========================
// CREATE PRIVATE CHAT
// =========================

export const createChat = async (req, res, next) => {
  try {
    const { userId } =
      req.validatedData?.body || req.body;

    const chat = await createPrivateChat(
      req.user._id,
      userId
    );

    return successResponse(
      res,
      201,
      "Private chat created successfully",
      {
        chat,
      }
    );
  } catch (error) {
    next(error);
  }
};

// =========================
// GET MY CHATS
// =========================

export const getChats = async (req, res, next) => {
  try {
    const chats = await getUserChats(req.user._id);

    return successResponse(
      res,
      200,
      "Chats fetched successfully",
      {
        chats,
      }
    );
  } catch (error) {
    next(error);
  }
};

// =========================
// GET CHAT BY ID
// =========================

export const getChat = async (req, res, next) => {
  try {
    const { chatId } =
      req.validatedData?.params || req.params;

    const chat = await getChatById(
      chatId,
      req.user._id
    );

    return successResponse(
      res,
      200,
      "Chat fetched successfully",
      {
        chat,
      }
    );
  } catch (error) {
    next(error);
  }
};

// =========================
// UPDATE CHAT SETTINGS
// =========================

export const updateSettings = async (
  req,
  res,
  next
) => {
  try {
    const { chatId } =
      req.validatedData?.params || req.params;

    const settings =
      req.validatedData?.body || req.body;

    const chat = await updateChatSettings(
      chatId,
      req.user._id,
      settings
    );

    return successResponse(
      res,
      200,
      "Chat settings updated successfully",
      {
        chat,
      }
    );
  } catch (error) {
    next(error);
  }
};

// =========================
// MARK CHAT AS READ
// =========================

export const markAsRead = async (
  req,
  res,
  next
) => {
  try {
    const { chatId } =
      req.validatedData?.params || req.params;

    const chat = await markChatAsRead(
      chatId,
      req.user._id
    );

    return successResponse(
      res,
      200,
      "Chat marked as read",
      {
        chat,
      }
    );
  } catch (error) {
    next(error);
  }
};

// =========================
// LEAVE CHAT
// =========================

export const leave = async (
  req,
  res,
  next
) => {
  try {
    const { chatId } =
      req.validatedData?.params || req.params;

    await leaveChat(
      chatId,
      req.user._id
    );

    return successResponse(
      res,
      200,
      "You left the chat successfully"
    );
  } catch (error) {
    next(error); 
  }
};