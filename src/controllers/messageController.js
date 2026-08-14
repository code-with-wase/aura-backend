import {
  sendMessage as sendMessageService,
  getMessages as getMessagesService,
  getMessage as getMessageService,
  editMessage as editMessageService,
  deleteMessage as deleteMessageService,
  markMessageDelivered as markMessageDeliveredService,
  markMessageRead as markMessageReadService,
  addReaction as addReactionService,
  removeReaction as removeReactionService,
  starMessage as starMessageService,
  unstarMessage as unstarMessageService,
  forwardMessage as forwardMessageService,
} from "../services/messageService.js";

import {
  successResponse,
} from "../utils/response.js";

// =====================================================
// SEND MESSAGE
// =====================================================

export const sendMessage = async (
  req,
  res,
  next
) => {
  try {
    const data =
      req.validatedData?.body ||
      req.body;

    const message =
      await sendMessageService({
        userId: req.user._id,
        ...data,
      });

    return successResponse(
      res,
      201,
      "Message sent successfully",
      {
        message,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET CHAT MESSAGES
// =====================================================

export const getMessages = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const query =
      req.validatedData?.query ||
      req.query;

    const result =
      await getMessagesService({
        userId: req.user._id,
        chatId: params.chatId,
        page: query.page,
        limit: query.limit,
      });

    return successResponse(
      res,
      200,
      "Messages fetched successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET SINGLE MESSAGE
// =====================================================

export const getMessage = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const message =
      await getMessageService({
        userId: req.user._id,
        messageId: params.messageId,
      });

    return successResponse(
      res,
      200,
      "Message fetched successfully",
      {
        message,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// EDIT MESSAGE
// =====================================================

export const editMessage = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const body =
      req.validatedData?.body ||
      req.body;

    const message =
      await editMessageService({
        userId: req.user._id,
        messageId: params.messageId,
        content: body.content,
      });

    return successResponse(
      res,
      200,
      "Message updated successfully",
      {
        message,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// DELETE MESSAGE
// =====================================================

export const deleteMessage = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const body =
      req.validatedData?.body ||
      req.body ||
      {};

    const result =
      await deleteMessageService({
        userId: req.user._id,
        messageId: params.messageId,
        deleteForEveryone:
          body.deleteForEveryone ||
          false,
      });

    return successResponse(
      res,
      200,
      result.deletedForEveryone
        ? "Message deleted for everyone successfully"
        : "Message deleted for you successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// MARK MESSAGE DELIVERED
// =====================================================

export const markMessageDelivered =
  async (req, res, next) => {
    try {
      const params =
        req.validatedData?.params ||
        req.params;

      const message =
        await markMessageDeliveredService({
          userId: req.user._id,
          messageId: params.messageId,
        });

      return successResponse(
        res,
        200,
        "Message marked as delivered",
        {
          message,
        }
      );
    } catch (error) {
      return next(error);
    }
  };

// =====================================================
// MARK MESSAGE READ
// =====================================================

export const markMessageRead =
  async (req, res, next) => {
    try {
      const params =
        req.validatedData?.params ||
        req.params;

      const message =
        await markMessageReadService({
          userId: req.user._id,
          messageId: params.messageId,
        });

      return successResponse(
        res,
        200,
        "Message marked as read",
        {
          message,
        }
      );
    } catch (error) {
      return next(error);
    }
  };

// =====================================================
// ADD REACTION
// =====================================================

export const addReaction = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const body =
      req.validatedData?.body ||
      req.body;

    const message =
      await addReactionService({
        userId: req.user._id,
        messageId: params.messageId,
        emoji: body.emoji,
      });

    return successResponse(
      res,
      200,
      "Reaction added successfully",
      {
        message,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// REMOVE REACTION
// =====================================================

export const removeReaction = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const message =
      await removeReactionService({
        userId: req.user._id,
        messageId: params.messageId,
      });

    return successResponse(
      res,
      200,
      "Reaction removed successfully",
      {
        message,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// STAR MESSAGE
// =====================================================

export const starMessage = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const message =
      await starMessageService({
        userId: req.user._id,
        messageId: params.messageId,
      });

    return successResponse(
      res,
      200,
      "Message starred successfully",
      {
        message,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// UNSTAR MESSAGE
// =====================================================

export const unstarMessage = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const message =
      await unstarMessageService({
        userId: req.user._id,
        messageId: params.messageId,
      });

    return successResponse(
      res,
      200,
      "Message unstarred successfully",
      {
        message,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// FORWARD MESSAGE
// =====================================================

export const forwardMessage = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const body =
      req.validatedData?.body ||
      req.body;

    const message =
      await forwardMessageService({
        userId: req.user._id,
        messageId: params.messageId,
        chatId: body.chatId,
      });

    return successResponse(
      res,
      201,
      "Message forwarded successfully",
      {
        message,
      }
    );
  } catch (error) {
    return next(error);
  }
}; 