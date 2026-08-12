import {
  createNotification as createNotificationService,
  getNotifications as getNotificationsService,
  getNotification as getNotificationService,
  getUnreadNotifications as getUnreadNotificationsService,
  markNotificationAsRead as markNotificationAsReadService,
  markAllNotificationsAsRead as markAllNotificationsAsReadService,
  deleteNotification as deleteNotificationService,
  deleteAllNotifications as deleteAllNotificationsService,
} from "../services/notificationService.js"; 

import {
  successResponse,
} from "../utils/response.js";

// =====================================================
// CREATE NOTIFICATION
// =====================================================

export const createNotification = async (
  req,
  res,
  next
) => {
  try {
    const data =
      req.validatedData?.body ||
      req.body;

    const notification =
      await createNotificationService({
        userId: req.user._id,
        recipientId: data.recipientId,
        type: data.type,
        title: data.title,
        message: data.message,
        chatId: data.chatId,
        messageId: data.messageId,
        callId: data.callId,
        statusId: data.statusId,
        groupId: data.groupId,
        data: data.data,
      });

    return successResponse(
      res,
      201,
      "Notification created successfully",
      {
        notification,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET NOTIFICATIONS
// =====================================================

export const getNotifications = async (
  req,
  res,
  next
) => {
  try {
    const query =
      req.validatedData?.query ||
      req.query;

    const result =
      await getNotificationsService({
        userId: req.user._id,
        page: query.page,
        limit: query.limit,
        unreadOnly:
          query.unreadOnly === "true",
      });

    return successResponse(
      res,
      200,
      "Notifications fetched successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET SINGLE NOTIFICATION
// =====================================================

export const getNotification = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const notification =
      await getNotificationService({
        userId: req.user._id,
        notificationId:
          params.notificationId,
      });

    return successResponse(
      res,
      200,
      "Notification fetched successfully",
      {
        notification,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// MARK AS READ
// =====================================================

export const markNotificationAsRead =
  async (req, res, next) => {
    try {
      const params =
        req.validatedData?.params ||
        req.params;

      const notification =
        await markNotificationAsReadService({
          userId: req.user._id,
          notificationId:
            params.notificationId,
        });

      return successResponse(
        res,
        200,
        "Notification marked as read",
        {
          notification,
        }
      );
    } catch (error) {
      return next(error);
    }
  };

// =====================================================
// MARK ALL AS READ
// =====================================================

export const markAllNotificationsAsRead =
  async (req, res, next) => {
    try {
      const result =
        await markAllNotificationsAsReadService({
          userId: req.user._id,
        });

      return successResponse(
        res,
        200,
        "All notifications marked as read",
        result
      );
    } catch (error) {
      return next(error);
    }
  };

// =====================================================
// DELETE NOTIFICATION
// =====================================================

export const deleteNotification = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    await deleteNotificationService({
      userId: req.user._id,
      notificationId:
        params.notificationId,
    });

    return successResponse(
      res,
      200,
      "Notification deleted successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// DELETE ALL NOTIFICATIONS
// =====================================================

export const deleteAllNotifications =
  async (req, res, next) => {
    try {
      const result =
        await deleteAllNotificationsService({
          userId: req.user._id,
        });

      return successResponse(
        res,
        200,
        "All notifications deleted successfully",
        result
      );
    } catch (error) {
      return next(error);
    }
  }; 


  // =====================================================
// GET UNREAD NOTIFICATIONS
// =====================================================

export const getUnreadNotifications = async (
  req,
  res,
  next
) => {
  try {
    const query =
      req.validatedData?.query ||
      req.query;

    const result =
      await getUnreadNotificationsService({
        userId: req.user._id,
        page: query.page,
        limit: query.limit,
      });

    return successResponse(
      res,
      200,
      "Unread notifications fetched successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

