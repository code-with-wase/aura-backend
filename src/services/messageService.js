import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// =====================================================
// CHECK CHAT MEMBERSHIP
// =====================================================

const checkChatMembership = async (chatId, userId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    isActive: true,
    "participants.user": userId,
  });

  if (!chat) {
    throw new Error("You are not a member of this chat");
  }

  return chat;
};

// =====================================================
// UPDATE CHAT LAST MESSAGE
// =====================================================

const updateChatLastMessage = async (chatId) => {
  const latestMessage = await Message.findOne({
    chat: chatId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .select("_id createdAt");

  if (!latestMessage) {
    await Chat.findByIdAndUpdate(chatId, {
      $set: {
        lastMessage: null,
        lastMessageAt: null,
      },
    });

    return;
  }

  await Chat.findByIdAndUpdate(chatId, {
    $set: {
      lastMessage: latestMessage._id,
      lastMessageAt: latestMessage.createdAt,
    },
  });
};

// =====================================================
// SEND MESSAGE
// =====================================================

export const sendMessage = async ({
  userId,
  chatId,
  type = "text",
  content = null,
  attachment = null,
  replyTo = null,
  isForwarded = false,
  forwardedFrom = null,
}) => {
  const chat = await checkChatMembership(chatId, userId);

  // Text validation
  if (
    type === "text" &&
    (!content || !content.trim())
  ) {
    throw new Error("Message content is required");
  }

  // Reply validation
  if (replyTo) {
    const repliedMessage = await Message.findOne({
      _id: replyTo,
      chat: chatId,
      isDeleted: false,
    });

    if (!repliedMessage) {
      throw new Error("Reply message not found");
    }
  }

  // Forward validation
  if (isForwarded && forwardedFrom) {
    const originalMessage = await Message.findOne({
      _id: forwardedFrom,
      isDeleted: false,
    });

    if (!originalMessage) {
      throw new Error("Original forwarded message not found");
    }
  }

  const message = await Message.create({
    chat: chatId,
    sender: userId,
    type,
    content:
      typeof content === "string"
        ? content.trim() || null
        : null,
    attachment: attachment || null,
    replyTo: replyTo || null,
    isForwarded: Boolean(isForwarded),
    forwardedFrom: forwardedFrom || null,
    status: "sent",
  });

  // Update chat
  chat.lastMessage = message._id;
  chat.lastMessageAt = message.createdAt;

  chat.participants.forEach((participant) => {
    if (
      participant.user.toString() !==
      userId.toString()
    ) {
      participant.unreadCount =
        (participant.unreadCount || 0) + 1;
    }
  });

  await chat.save();

  // Populate
  await message.populate([
    {
      path: "sender",
      select: "_id name username avatar",
    },
    {
      path: "replyTo",
      select: "_id sender type content createdAt",
      populate: {
        path: "sender",
        select: "_id name username avatar",
      },
    },
    {
      path: "forwardedFrom",
      select: "_id sender type content createdAt",
      populate: {
        path: "sender",
        select: "_id name username avatar",
      },
    },
  ]);

  return message;
};

// =====================================================
// GET CHAT MESSAGES
// =====================================================

export const getMessages = async ({
  userId,
  chatId,
  page = 1,
  limit = 50,
}) => {
  await checkChatMembership(chatId, userId);

  const pageNumber = Math.max(
    Number(page) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(Number(limit) || 50, 1),
    100
  );

  const skip =
    (pageNumber - 1) * limitNumber;

  const filter = {
    chat: chatId,
    isDeleted: false,
    deletedFor: {
      $ne: userId,
    },
  };

  const [
    messages,
    totalMessages,
  ] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "sender",
        select: "_id name username avatar",
      })
      .populate({
        path: "replyTo",
        select: "_id sender type content createdAt",
        populate: {
          path: "sender",
          select: "_id name username avatar",
        },
      })
      .populate({
        path: "forwardedFrom",
        select: "_id sender type content createdAt",
        populate: {
          path: "sender",
          select: "_id name username avatar",
        },
      })
      .populate({
        path: "reactions.user",
        select: "_id name username avatar",
      }),

    Message.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(
    totalMessages / limitNumber
  );

  return {
    messages: messages.reverse(),

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalMessages,
      totalPages,
      hasNextPage:
        pageNumber < totalPages,
      hasPreviousPage:
        pageNumber > 1,
    },
  };
};

// =====================================================
// GET SINGLE MESSAGE
// =====================================================

export const getMessage = async ({
  userId,
  messageId,
}) => {
  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
    deletedFor: {
      $ne: userId,
    },
  })
    .populate({
      path: "sender",
      select: "_id name username avatar",
    })
    .populate({
      path: "replyTo",
      select: "_id sender type content createdAt",
      populate: {
        path: "sender",
        select: "_id name username avatar",
      },
    })
    .populate({
      path: "forwardedFrom",
      select: "_id sender type content createdAt",
      populate: {
        path: "sender",
        select: "_id name username avatar",
      },
    })
    .populate({
      path: "reactions.user",
      select: "_id name username avatar",
    });

  if (!message) {
    throw new Error("Message not found");
  }

  await checkChatMembership(
    message.chat,
    userId
  );

  return message;
};

// =====================================================
// EDIT MESSAGE
// =====================================================

export const editMessage = async ({
  userId,
  messageId,
  content,
}) => {
  if (
    !content ||
    !content.trim()
  ) {
    throw new Error(
      "Message content is required"
    );
  }

  const message = await Message.findOne({
    _id: messageId,
    sender: userId,
    isDeleted: false,
  });

  if (!message) {
    throw new Error(
      "Message not found or you are not the sender"
    );
  }

  if (message.type !== "text") {
    throw new Error(
      "Only text messages can be edited"
    );
  }

  message.content = content.trim();
  message.isEdited = true;
  message.editedAt = new Date();

  await message.save();

  await message.populate({
    path: "sender",
    select: "_id name username avatar",
  });

  return message;
};

// =====================================================
// DELETE MESSAGE
// =====================================================

export const deleteMessage = async ({
  userId,
  messageId,
  deleteForEveryone = false,
}) => {
  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  // Verify user belongs to chat
  await checkChatMembership(
    message.chat,
    userId
  );

  // =================================================
  // DELETE FOR EVERYONE
  // =================================================

  if (deleteForEveryone) {
    if (
      message.sender.toString() !==
      userId.toString()
    ) {
      throw new Error(
        "Only the sender can delete this message for everyone"
      );
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = null;
    message.attachment = null;

    await message.save();

    await updateChatLastMessage(
      message.chat
    );

    return {
      messageId: message._id,
      deletedForEveryone: true,
    };
  }

  // =================================================
  // DELETE FOR ME
  // =================================================

  const alreadyDeleted =
    message.deletedFor.some(
      (id) =>
        id.toString() ===
        userId.toString()
    );

  if (!alreadyDeleted) {
    message.deletedFor.push(userId);
    await message.save();
  }

  return {
    messageId: message._id,
    deletedForEveryone: false,
  };
};

// =====================================================
// MARK MESSAGE DELIVERED
// =====================================================

export const markMessageDelivered = async ({
  userId,
  messageId,
}) => {
  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  await checkChatMembership(
    message.chat,
    userId
  );

  // Sender cannot mark own message delivered
  if (
    message.sender.toString() ===
    userId.toString()
  ) {
    throw new Error(
      "Sender cannot mark their own message as delivered"
    );
  }

  if (message.status === "sent") {
    message.status = "delivered";
    message.deliveredAt = new Date();

    await message.save();
  }

  return message;
};

// =====================================================
// MARK MESSAGE READ
// =====================================================

export const markMessageRead = async ({
  userId,
  messageId,
}) => {
  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  const chat = await checkChatMembership(
    message.chat,
    userId
  );

  if (
    message.sender.toString() !==
    userId.toString()
  ) {
    message.status = "read";
    message.readAt = new Date();

    await message.save();
  }

  const participant =
    chat.participants.find(
      (item) =>
        item.user.toString() ===
        userId.toString()
    );

  if (participant) {
    participant.unreadCount = 0;
    participant.lastReadAt =
      new Date();
  }

  await chat.save();

  return message;
};

// =====================================================
// ADD REACTION
// =====================================================

export const addReaction = async ({
  userId,
  messageId,
  emoji,
}) => {
  if (
    !emoji ||
    !emoji.trim()
  ) {
    throw new Error(
      "Reaction emoji is required"
    );
  }

  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  await checkChatMembership(
    message.chat,
    userId
  );

  const existingReaction =
    message.reactions.find(
      (reaction) =>
        reaction.user.toString() ===
        userId.toString()
    );

  if (existingReaction) {
    existingReaction.emoji =
      emoji.trim();
    existingReaction.createdAt =
      new Date();
  } else {
    message.reactions.push({
      user: userId,
      emoji: emoji.trim(),
    });
  }

  await message.save();

  await message.populate({
    path: "reactions.user",
    select: "_id name username avatar",
  });

  return message;
};

// =====================================================
// REMOVE REACTION
// =====================================================

export const removeReaction = async ({
  userId,
  messageId,
}) => {
  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  await checkChatMembership(
    message.chat,
    userId
  );

  message.reactions =
    message.reactions.filter(
      (reaction) =>
        reaction.user.toString() !==
        userId.toString()
    );

  await message.save();

  await message.populate({
    path: "reactions.user",
    select: "_id name username avatar",
  });

  return message;
};

// =====================================================
// STAR MESSAGE
// =====================================================

export const starMessage = async ({
  userId,
  messageId,
}) => {
  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  await checkChatMembership(
    message.chat,
    userId
  );

  const alreadyStarred =
    message.starredBy.some(
      (id) =>
        id.toString() ===
        userId.toString()
    );

  if (!alreadyStarred) {
    message.starredBy.push(userId);
    await message.save();
  }

  return message;
};

// =====================================================
// UNSTAR MESSAGE
// =====================================================

export const unstarMessage = async ({
  userId,
  messageId,
}) => {
  const message = await Message.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  await checkChatMembership(
    message.chat,
    userId
  );

  message.starredBy =
    message.starredBy.filter(
      (id) =>
        id.toString() !==
        userId.toString()
    );

  await message.save();

  return message;
};

// =====================================================
// FORWARD MESSAGE
// =====================================================

export const forwardMessage = async ({
  userId,
  messageId,
  chatId,
}) => {
  const sourceMessage =
    await Message.findOne({
      _id: messageId,
      isDeleted: false,
    });

  if (!sourceMessage) {
    throw new Error(
      "Message not found"
    );
  }

  // User must belong to source chat
  await checkChatMembership(
    sourceMessage.chat,
    userId
  );

  // User must belong to destination chat
  await checkChatMembership(
    chatId,
    userId
  );

  const forwardedMessage =
    await Message.create({
      chat: chatId,
      sender: userId,
      type: sourceMessage.type,
      content: sourceMessage.content,
      attachment:
        sourceMessage.attachment,
      isForwarded: true,
      forwardedFrom:
        sourceMessage._id,
      status: "sent",
    });

  const destinationChat =
    await Chat.findById(chatId);

  if (destinationChat) {
    destinationChat.lastMessage =
      forwardedMessage._id;

    destinationChat.lastMessageAt =
      forwardedMessage.createdAt;

    destinationChat.participants.forEach(
      (participant) => {
        if (
          participant.user.toString() !==
          userId.toString()
        ) {
          participant.unreadCount =
            (participant.unreadCount || 0) +
            1;
        }
      }
    );

    await destinationChat.save();
  }

  await forwardedMessage.populate([
    {
      path: "sender",
      select: "_id name username avatar",
    },
    {
      path: "forwardedFrom",
      select: "_id sender type content createdAt",
      populate: {
        path: "sender",
        select: "_id name username avatar",
      },
    },
  ]);

  return forwardedMessage;
}; 