import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Group from "../models/Group.js";

// =========================
// CREATE / GET PRIVATE CHAT
// =========================

export const createPrivateChat = async (
  currentUserId,
  otherUserId
) => {
  if (
    currentUserId.toString() ===
    otherUserId.toString()
  ) {
    throw new Error(
      "You cannot create a chat with yourself"
    );
  }

  const otherUser =
    await User.findById(otherUserId);

  if (!otherUser) {
    throw new Error("User not found");
  }

  if (!otherUser.isActive) {
    throw new Error(
      "User account is inactive"
    );
  }

  const existingChat =
    await Chat.findOne({
      type: "private",
      isActive: true,
      "participants.user": {
        $all: [
          currentUserId,
          otherUserId,
        ],
      },
    })
      .populate(
        "participants.user",
        "_id name username email phone avatar about isOnline lastSeen"
      )
      .populate("lastMessage");

  if (existingChat) {
    return existingChat;
  }

  const chat =
    await Chat.create({
      type: "private",

      participants: [
        {
          user: currentUserId,
          isAdmin: false,
          isMuted: false,
          isArchived: false,
          isPinned: false,
          unreadCount: 0,
        },
        {
          user: otherUserId,
          isAdmin: false,
          isMuted: false,
          isArchived: false,
          isPinned: false,
          unreadCount: 0,
        },
      ],

      isActive: true,
    });

  const populatedChat =
    await Chat.findById(chat._id)
      .populate(
        "participants.user",
        "_id name username email phone avatar about isOnline lastSeen"
      )
      .populate("lastMessage");

  return populatedChat;
};

// =========================
// CREATE GROUP CHAT
// =========================

export const createGroupChat = async (
  groupId,
  userId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      groupId
    )
  ) {
    throw new Error(
      "Invalid group ID"
    );
  }

  const group =
    await Group.findOne({
      _id: groupId,
      isActive: true,
      "members.user": userId,
      "members.leftAt": null,
    });

  if (!group) {
    throw new Error(
      "Group not found or you are not a member"
    );
  }

  const existingChat =
    await Chat.findOne({
      type: "group",
      group: group._id,
      isActive: true,
    });

  if (existingChat) {
    return existingChat;
  }

  const participants =
    group.members
      .filter(
        (member) =>
          !member.leftAt
      )
      .map((member) => ({
        user: member.user,
        isAdmin:
          member.role === "admin",
        isMuted:
          member.isMuted || false,
        isArchived: false,
        isPinned: false,
        unreadCount: 0,
        lastReadAt: null,
        joinedAt:
          member.joinedAt,
        leftAt: null,
      }));

  const chat =
    await Chat.create({
      type: "group",
      group: group._id,
      participants,
      isActive: true,
    });

  return Chat.findById(chat._id)
    .populate(
      "participants.user",
      "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy"
    )
    .populate("group")
    .populate("lastMessage");
};

// =========================
// GET USER CHATS
// =========================

export const getUserChats = async (
  userId
) => {
  const chats =
    await Chat.find({
      "participants.user": userId,
      "participants.leftAt": null,
      isActive: true,
    })
      .populate(
        "participants.user",
        "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy"
      )
      .populate({
        path: "lastMessage",
        select:
          "_id chat sender type content status createdAt isDeleted isEdited",
      })
      .populate("group")
      .sort({
        lastMessageAt: -1,
        updatedAt: -1,
      });

  return chats;
};

// =========================
// GET CHAT BY ID
// =========================

export const getChatById = async (
  chatId,
  userId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      chatId
    )
  ) {
    throw new Error(
      "Invalid chat ID"
    );
  }

  const chat =
    await Chat.findOne({
      _id: chatId,
      "participants.user": userId,
      isActive: true,
    })
      .populate(
        "participants.user",
        "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy"
      )
      .populate({
        path: "lastMessage",
        select:
          "_id chat sender type content status createdAt isDeleted isEdited",
      })
      .populate("group");

  if (!chat) {
    throw new Error(
      "Chat not found"
    );
  }

  return chat;
};

// =========================
// UPDATE CHAT SETTINGS
// =========================

export const updateChatSettings =
  async (
    chatId,
    userId,
    settings
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        chatId
      )
    ) {
      throw new Error(
        "Invalid chat ID"
      );
    }

    const chat =
      await Chat.findOne({
        _id: chatId,
        "participants.user": userId,
        isActive: true,
      });

    if (!chat) {
      throw new Error(
        "Chat not found"
      );
    }

    const participant =
      chat.participants.find(
        (item) =>
          item.user.toString() ===
          userId.toString()
      );

    if (!participant) {
      throw new Error(
        "You are not a participant of this chat"
      );
    }

    if (
      settings.isMuted !==
      undefined
    ) {
      participant.isMuted =
        settings.isMuted;
    }

    if (
      settings.isArchived !==
      undefined
    ) {
      participant.isArchived =
        settings.isArchived;
    }

    if (
      settings.isPinned !==
      undefined
    ) {
      participant.isPinned =
        settings.isPinned;
    }

    await chat.save();

    return Chat.findById(chat._id)
      .populate(
        "participants.user",
        "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy"
      )
      .populate("lastMessage")
      .populate("group");
  };

// =========================
// MARK CHAT AS READ
// =========================

export const markChatAsRead =
  async (
    chatId,
    userId
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        chatId
      )
    ) {
      throw new Error(
        "Invalid chat ID"
      );
    }

    const chat =
      await Chat.findOne({
        _id: chatId,
        "participants.user": userId,
        isActive: true,
      });

    if (!chat) {
      throw new Error(
        "Chat not found"
      );
    }

    const participant =
      chat.participants.find(
        (item) =>
          item.user.toString() ===
          userId.toString()
      );

    if (!participant) {
      throw new Error(
        "You are not a participant of this chat"
      );
    }

    participant.unreadCount = 0;
    participant.lastReadAt =
      new Date();

    await chat.save();

    return chat;
  };

// =========================
// LEAVE CHAT
// =========================

export const leaveChat = async (
  chatId,
  userId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      chatId
    )
  ) {
    throw new Error(
      "Invalid chat ID"
    );
  }

  const chat =
    await Chat.findOne({
      _id: chatId,
      "participants.user": userId,
      isActive: true,
    });

  if (!chat) {
    throw new Error(
      "Chat not found"
    );
  }

  const participant =
    chat.participants.find(
      (item) =>
        item.user.toString() ===
        userId.toString()
    );

  if (!participant) {
    throw new Error(
      "You are not a participant of this chat"
    );
  }

  participant.leftAt =
    new Date();

  await chat.save();

  return true;
}; 