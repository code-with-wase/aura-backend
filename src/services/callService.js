import mongoose from "mongoose";

import Call from "../models/Call.js";
import Chat from "../models/Chat.js";

// =====================================================
// CHECK CHAT MEMBERSHIP
// =====================================================

const checkChatMembership = async (chatId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new Error("Invalid chat ID");
  }

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
// POPULATE CALL
// =====================================================

const populateCall = async (call) => {
  await call.populate([
    {
      path: "caller",
      select: "_id name username avatar",
    },
    {
      path: "participants.user",
      select: "_id name username avatar",
    },
    {
      path: "endedBy",
      select: "_id name username avatar",
    },
  ]);

  return call;
};

// =====================================================
// CREATE CALL
// =====================================================

export const createCall = async ({
  userId,
  type,
  mode = "private",
  chatId,
  participantIds,
}) => {
  const chat = await checkChatMembership(chatId, userId);

  // ---------------------------------------------------
  // Remove duplicate participants
  // ---------------------------------------------------

  const uniqueParticipantIds = [
    ...new Set(participantIds.map((id) => id.toString())),
  ];

  // ---------------------------------------------------
  // Caller must not be participant twice
  // ---------------------------------------------------

  const filteredParticipantIds = uniqueParticipantIds.filter(
    (id) => id !== userId.toString()
  );

  if (filteredParticipantIds.length === 0) {
    throw new Error("At least one other participant is required");
  }

  // ---------------------------------------------------
  // Validate participants are members of chat
  // ---------------------------------------------------

  const chatMemberIds = chat.participants.map((participant) =>
    participant.user.toString()
  );

  for (const participantId of filteredParticipantIds) {
    if (!chatMemberIds.includes(participantId)) {
      throw new Error(
        "All call participants must be members of the chat"
      );
    }
  }

  // ---------------------------------------------------
  // Private call validation
  // ---------------------------------------------------

  if (
    mode === "private" &&
    filteredParticipantIds.length !== 1
  ) {
    throw new Error(
      "Private call must have exactly one participant"
    );
  }

  // ---------------------------------------------------
  // Group call validation
  // ---------------------------------------------------

  if (
    mode === "group" &&
    filteredParticipantIds.length < 1
  ) {
    throw new Error(
      "Group call requires at least one participant"
    );
  }

  // ---------------------------------------------------
  // Check active call
  // ---------------------------------------------------

  const activeCall = await Call.findOne({
    chat: chatId,
    status: {
      $in: ["initiated", "ringing", "ongoing"],
    },
    $or: [
      { caller: userId },
      {
        "participants.user": userId,
      },
    ],
  });

  if (activeCall) {
    throw new Error("You already have an active call");
  }

  // ---------------------------------------------------
  // Create participants
  // ---------------------------------------------------

  const participants = filteredParticipantIds.map(
    (participantId) => ({
      user: participantId,
      status: "invited",
      joinedAt: null,
      leftAt: null,
    })
  );

  // ---------------------------------------------------
  // Create call
  // ---------------------------------------------------

  const call = await Call.create({
    type,
    mode,
    chat: chatId,
    caller: userId,
    participants,
    status: "initiated",
    startedAt: null,
    endedAt: null,
    duration: 0,
    endedBy: null,
    endReason: null,
  });

  await populateCall(call);

  return call;
};

// =====================================================
// GET SINGLE CALL
// =====================================================

export const getCall = async ({
  userId,
  callId,
}) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  // ---------------------------------------------------
  // Check chat membership
  // ---------------------------------------------------

  await checkChatMembership(call.chat, userId);

  await populateCall(call);

  return call;
};

// =====================================================
// GET CALL HISTORY
// =====================================================

export const getCallHistory = async ({
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

  const chatIds = await Chat.find({
    isActive: true,
    "participants.user": userId,
  }).distinct("_id");

  const filter = {
    chat: {
      $in: chatIds,
    },
    $or: [
      {
        caller: userId,
      },
      {
        "participants.user": userId,
      },
    ],
  };

  const [calls, totalCalls] = await Promise.all([
    Call.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "caller",
        select: "_id name username avatar",
      })
      .populate({
        path: "participants.user",
        select: "_id name username avatar",
      })
      .populate({
        path: "endedBy",
        select: "_id name username avatar",
      }),

    Call.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCalls / limitNumber);

  return {
    calls,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalCalls,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  };
};

// =====================================================
// MARK CALL RINGING
// =====================================================

export const markCallRinging = async ({
  userId,
  callId,
}) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  await checkChatMembership(call.chat, userId);

  // Only caller can start ringing
  if (
    call.caller.toString() !== userId.toString()
  ) {
    throw new Error(
      "Only the caller can start ringing"
    );
  }

  if (call.status !== "initiated") {
    throw new Error(
      "Call cannot be moved to ringing state"
    );
  }

  call.status = "ringing";

  call.participants.forEach((participant) => {
    if (participant.status === "invited") {
      participant.status = "ringing";
    }
  });

  await call.save();

  await populateCall(call);

  return call;
};

// =====================================================
// JOIN CALL
// =====================================================

export const joinCall = async ({
  userId,
  callId,
}) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  await checkChatMembership(call.chat, userId);

  const participant = call.participants.find(
    (item) =>
      item.user.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error(
      "You are not a participant of this call"
    );
  }

  if (
    ["declined", "left"].includes(
      participant.status
    )
  ) {
    throw new Error(
      "You cannot join this call"
    );
  }

  if (
    [
      "completed",
      "rejected",
      "missed",
      "cancelled",
    ].includes(call.status)
  ) {
    throw new Error("Call has already ended");
  }

  participant.status = "joined";
  participant.joinedAt =
    participant.joinedAt || new Date();
  participant.leftAt = null;

  // ---------------------------------------------------
  // Call becomes ongoing
  // ---------------------------------------------------

  if (
    call.status === "initiated" ||
    call.status === "ringing"
  ) {
    call.status = "ongoing";

    if (!call.startedAt) {
      call.startedAt = new Date();
    }
  }

  await call.save();

  await populateCall(call);

  return call;
};

// =====================================================
// DECLINE CALL
// =====================================================

export const declineCall = async ({
  userId,
  callId,
}) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  await checkChatMembership(call.chat, userId);

  const participant = call.participants.find(
    (item) =>
      item.user.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error(
      "You are not a participant of this call"
    );
  }

  if (participant.status === "joined") {
    throw new Error(
      "Joined participant cannot decline the call"
    );
  }

  if (
    [
      "completed",
      "rejected",
      "missed",
      "cancelled",
    ].includes(call.status)
  ) {
    throw new Error("Call has already ended");
  }

  participant.status = "declined";
  participant.leftAt = new Date();

  // ---------------------------------------------------
  // If everyone declined, reject call
  // ---------------------------------------------------

  const hasActiveParticipant =
    call.participants.some((item) =>
      ["invited", "ringing", "joined"].includes(
        item.status
      )
    );

  if (!hasActiveParticipant) {
    call.status = "rejected";
    call.endedAt = new Date();
    call.endedBy = userId;
    call.endReason = "rejected";
  }

  await call.save();

  await populateCall(call);

  return call;
};

// =====================================================
// LEAVE CALL
// =====================================================

export const leaveCall = async ({
  userId,
  callId,
}) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  await checkChatMembership(call.chat, userId);

  const participant = call.participants.find(
    (item) =>
      item.user.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error(
      "You are not a participant of this call"
    );
  }

  if (participant.status !== "joined") {
    throw new Error(
      "You have not joined this call"
    );
  }

  participant.status = "left";
  participant.leftAt = new Date();

  // ---------------------------------------------------
  // Check remaining joined participants
  // ---------------------------------------------------

  const remainingJoined =
    call.participants.some(
      (item) => item.status === "joined"
    );

  if (!remainingJoined) {
    await completeCallInternal(
      call,
      userId,
      "completed"
    );
  }

  await call.save();

  await populateCall(call);

  return call;
};

// =====================================================
// COMPLETE CALL INTERNAL
// =====================================================

const completeCallInternal = async (
  call,
  userId,
  reason
) => {
  const now = new Date();

  call.status =
    reason === "rejected"
      ? "rejected"
      : reason === "missed"
      ? "missed"
      : reason === "cancelled"
      ? "cancelled"
      : "completed";

  call.endedAt = now;
  call.endedBy = userId;
  call.endReason = reason;

  if (call.startedAt) {
    call.duration = Math.max(
      0,
      Math.floor(
        (now.getTime() -
          call.startedAt.getTime()) /
          1000
      )
    );
  } else {
    call.duration = 0;
  }

  call.participants.forEach((participant) => {
    if (
      ["invited", "ringing"].includes(
        participant.status
      )
    ) {
      participant.status = "missed";
      participant.leftAt = now;
    }
  });
};

// =====================================================
// MARK CALL MISSED
// =====================================================

export const markCallMissed = async ({
  userId,
  callId,
}) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  await checkChatMembership(call.chat, userId);

  const isCaller =
    call.caller.toString() ===
    userId.toString();

  const isParticipant =
    call.participants.some(
      (participant) =>
        participant.user.toString() ===
        userId.toString()
    );

  if (!isCaller && !isParticipant) {
    throw new Error(
      "You are not part of this call"
    );
  }

  if (
    [
      "completed",
      "rejected",
      "missed",
      "cancelled",
    ].includes(call.status)
  ) {
    throw new Error(
      "Call has already ended"
    );
  }

  await completeCallInternal(
    call,
    userId,
    "missed"
  );

  await call.save();

  await populateCall(call);

  return call;
};

// =====================================================
// END CALL PUBLIC SERVICE
// =====================================================

export const endCall = async ({
  userId,
  callId,
  reason = "completed",
}) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  await checkChatMembership(call.chat, userId);

  const isCaller =
    call.caller.toString() ===
    userId.toString();

  const isParticipant =
    call.participants.some(
      (participant) =>
        participant.user.toString() ===
        userId.toString()
    );

  if (!isCaller && !isParticipant) {
    throw new Error(
      "You are not part of this call"
    );
  }

  if (
    [
      "completed",
      "rejected",
      "missed",
      "cancelled",
    ].includes(call.status)
  ) {
    throw new Error(
      "Call has already ended"
    );
  }

  await completeCallInternal(
    call,
    userId,
    reason
  );

  await call.save();

  await populateCall(call);

  return call;
};