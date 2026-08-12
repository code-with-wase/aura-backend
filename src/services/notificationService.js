import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import User from "../models/User.js";

// =====================================================
// POPULATE NOTIFICATION
// =====================================================

const populateNotification = async (
  notification
) => {
  await notification.populate([
    {
      path: "recipient",
      select: "_id name username avatar",
    },
    {
      path: "sender",
      select: "_id name username avatar",
    },
    {
      path: "chat",
      select: "_id type",
    },
    {
      path: "messageRef",
      select: "_id type content createdAt",
    },
    {
      path: "call",
      select: "_id type mode status createdAt",
    },
    {
      path: "status",
      select: "_id type content createdAt",
    },
    {
      path: "group",
      select: "_id name avatar",
    },
  ]);

  return notification;
};

// =====================================================
// CREATE NOTIFICATION
// =====================================================

export const createNotification = async ({
  userId,
  recipientId,
  type,
  title,
  message,
  chatId,
  messageId,
  callId,
  statusId,
  groupId,
  data,
}) => {
  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    throw new Error("Invalid recipient ID");
  }

  const recipient = await User.findById(
    recipientId
  );

  if (!recipient) {
    throw new Error("Recipient user not found");
  }

  const notification = await Notification.create({
    recipient: recipientId,
    sender: userId,
    type,
    title,
    message,
    chat: chatId || null,
    messageRef: messageId || null,
    call: callId || null,
    status: statusId || null,
    group: groupId || null,
    data: data || null,
    isRead: false,
    readAt: null,
  });

  await populateNotification(notification);

  return notification;
};

// =====================================================
// GET NOTIFICATIONS
// =====================================================

export const getNotifications = async ({
  userId,
  page = 1,
  limit = 20,
  unreadOnly = false,
}) => {
  const pageNumber = Math.max(
    Number(page) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip =
    (pageNumber - 1) * limitNumber;

  const filter = {
    recipient: userId,
  };

  if (
    unreadOnly === true ||
    unreadOnly === "true"
  ) {
    filter.isRead = false;
  }

  const [
    notifications,
    totalNotifications,
    unreadCount,
  ] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "sender",
        select: "_id name username avatar",
      })
      .populate({
        path: "chat",
        select: "_id type",
      })
      .populate({
        path: "messageRef",
        select: "_id type content createdAt",
      })
      .populate({
        path: "call",
        select: "_id type mode status createdAt",
      })
      .populate({
        path: "status",
        select: "_id type content createdAt",
      })
      .populate({
        path: "group",
        select: "_id name avatar",
      }),

    Notification.countDocuments(filter),

    Notification.countDocuments({
      recipient: userId,
      isRead: false,
    }),
  ]);

  const totalPages = Math.ceil(
    totalNotifications / limitNumber
  );

  return {
    notifications,

    unreadCount,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalNotifications,
      totalPages,
      hasNextPage:
        pageNumber < totalPages,
      hasPreviousPage:
        pageNumber > 1,
    },
  };
};

// =====================================================
// GET SINGLE NOTIFICATION
// =====================================================

export const getNotification = async ({
  userId,
  notificationId,
}) => {
  const notification =
    await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

  if (!notification) {
    throw new Error(
      "Notification not found"
    );
  }

  await populateNotification(notification);

  return notification;
};

// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

export const markNotificationAsRead =
  async ({
    userId,
    notificationId,
  }) => {
    const notification =
      await Notification.findOne({
        _id: notificationId,
        recipient: userId,
      });

    if (!notification) {
      throw new Error(
        "Notification not found"
      );
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();

      await notification.save();
    }

    await populateNotification(notification);

    return notification;
  };

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

export const markAllNotificationsAsRead =
  async ({ userId }) => {
    const result =
      await Notification.updateMany(
        {
          recipient: userId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

    return {
      modifiedCount: result.modifiedCount,
    };
  };

// =====================================================
// DELETE NOTIFICATION
// =====================================================

export const deleteNotification = async ({
  userId,
  notificationId,
}) => {
  const notification =
    await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

  if (!notification) {
    throw new Error(
      "Notification not found"
    );
  }

  return notification;
};

// =====================================================
// DELETE ALL NOTIFICATIONS
// =====================================================

export const deleteAllNotifications =
  async ({ userId }) => {
    const result =
      await Notification.deleteMany({
        recipient: userId,
      });

    return {
      deletedCount: result.deletedCount,
    };
  }; 


  // =====================================================
// GET UNREAD NOTIFICATIONS
// =====================================================

export const getUnreadNotifications = async ({
  userId,
  page = 1,
  limit = 20,
}) => {
  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    recipient: userId,
    isRead: false,
  };

  const [notifications, totalNotifications] =
    await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate({
          path: "sender",
          select: "_id name username avatar",
        }),

      Notification.countDocuments(filter),
    ]);

  const totalPages = Math.ceil(
    totalNotifications / limitNumber
  );

  return {
    notifications,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalNotifications,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  };
};  