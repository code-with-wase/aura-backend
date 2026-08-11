import mongoose from "mongoose";

import Group from "../models/Group.js";
import User from "../models/User.js";

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// GET GROUP
// =====================================================

const findGroup = async (groupId) => {
  if (!isValidObjectId(groupId)) {
    throw new Error("Invalid group ID");
  }

  const group = await Group.findOne({
    _id: groupId,
    isActive: true,
  });

  if (!group) {
    throw new Error("Group not found");
  }

  return group;
};

// =====================================================
// GET ACTIVE MEMBER
// =====================================================

const getMember = (group, userId) => {
  return group.members.find(
    (member) =>
      member.user.toString() === userId.toString() &&
      !member.leftAt
  );
};

// =====================================================
// REQUIRE MEMBER
// =====================================================

const requireMember = (group, userId) => {
  const member = getMember(group, userId);

  if (!member) {
    throw new Error("You are not a member of this group");
  }

  return member;
};

// =====================================================
// REQUIRE ADMIN
// =====================================================

const requireAdmin = (group, userId) => {
  const member = requireMember(group, userId);

  if (member.role !== "admin") {
    throw new Error("Only group admins can perform this action");
  }

  return member;
};

// =====================================================
// POPULATE GROUP
// =====================================================

const populateGroup = async (group) => {
  await group.populate([
    {
      path: "createdBy",
      select: "_id name username avatar",
    },
    {
      path: "members.user",
      select: "_id name username avatar",
    },
  ]);

  return group;
};

// =====================================================
// CREATE GROUP
// =====================================================

export const createGroup = async ({
  userId,
  name,
  description = null,
  avatar = null,
  avatarPublicId = null,
  memberIds = [],
}) => {
  if (!name || !name.trim()) {
    throw new Error("Group name is required");
  }

  const uniqueMemberIds = [
    userId.toString(),
    ...memberIds.map((id) => id.toString()),
  ];

  const uniqueIds = [
    ...new Set(uniqueMemberIds),
  ];

  for (const id of uniqueIds) {
    if (!isValidObjectId(id)) {
      throw new Error(`Invalid member ID: ${id}`);
    }
  }

  const users = await User.find({
    _id: {
      $in: uniqueIds,
    },
  }).select("_id");

  if (users.length !== uniqueIds.length) {
    throw new Error("One or more users were not found");
  }

  const now = new Date();

  const members = uniqueIds.map((id, index) => ({
    user: id,
    role:
      id === userId.toString()
        ? "admin"
        : "member",
    joinedAt: now,
    leftAt: null,
    isMuted: false,
  }));

  const group = await Group.create({
    name: name.trim(),
    description:
      description?.trim() || null,
    avatar: avatar || null,
    avatarPublicId:
      avatarPublicId || null,
    createdBy: userId,
    members,
  });

  await populateGroup(group);

  return group;
};

// =====================================================
// GET MY GROUPS
// =====================================================

export const getGroups = async ({
  userId,
}) => {
  const groups = await Group.find({
    isActive: true,
    members: {
      $elemMatch: {
        user: userId,
        leftAt: null,
      },
    },
  })
    .sort({
      updatedAt: -1,
    })
    .populate({
      path: "createdBy",
      select: "_id name username avatar",
    })
    .populate({
      path: "members.user",
      select: "_id name username avatar",
    });

  return groups;
};

// =====================================================
// GET SINGLE GROUP
// =====================================================

export const getGroup = async ({
  userId,
  groupId,
}) => {
  const group = await findGroup(groupId);

  requireMember(group, userId);

  await populateGroup(group);

  return group;
};

// =====================================================
// UPDATE GROUP INFO
// =====================================================

export const updateGroup = async ({
  userId,
  groupId,
  name,
  description,
  avatar,
  avatarPublicId,
}) => {
  const group = await findGroup(groupId);

  requireMember(group, userId);

  if (
    group.settings.onlyAdminsCanEditInfo
  ) {
    requireAdmin(group, userId);
  }

  if (name !== undefined) {
    if (!name || !name.trim()) {
      throw new Error(
        "Group name cannot be empty"
      );
    }

    group.name = name.trim();
  }

  if (description !== undefined) {
    group.description =
      description?.trim() || null;
  }

  if (avatar !== undefined) {
    group.avatar = avatar || null;
  }

  if (avatarPublicId !== undefined) {
    group.avatarPublicId =
      avatarPublicId || null;
  }

  await group.save();

  await populateGroup(group);

  return group;
};

// =====================================================
// ADD MEMBERS
// =====================================================

export const addMembers = async ({
  userId,
  groupId,
  memberIds,
}) => {
  const group = await findGroup(groupId);

  requireMember(group, userId);

  if (
    group.settings.onlyAdminsCanAddMembers
  ) {
    requireAdmin(group, userId);
  }

  if (
    !Array.isArray(memberIds) ||
    memberIds.length === 0
  ) {
    throw new Error(
      "At least one member ID is required"
    );
  }

  const uniqueIds = [
    ...new Set(
      memberIds.map((id) => id.toString())
    ),
  ];

  for (const id of uniqueIds) {
    if (!isValidObjectId(id)) {
      throw new Error(
        `Invalid member ID: ${id}`
      );
    }
  }

  const users = await User.find({
    _id: {
      $in: uniqueIds,
    },
  }).select("_id");

  if (users.length !== uniqueIds.length) {
    throw new Error(
      "One or more users were not found"
    );
  }

  const newIds = uniqueIds.filter(
    (id) =>
      !getMember(group, id)
  );

  if (newIds.length === 0) {
    throw new Error(
      "All users are already members of this group"
    );
  }

  const now = new Date();

  for (const id of newIds) {
    group.members.push({
      user: id,
      role: "member",
      joinedAt: now,
      leftAt: null,
      isMuted: false,
    });
  }

  await group.save();

  await populateGroup(group);

  return group;
};

// =====================================================
// REMOVE MEMBER
// =====================================================

export const removeMember = async ({
  userId,
  groupId,
  memberId,
}) => {
  const group = await findGroup(groupId);

  requireMember(group, userId);

  const requester =
    getMember(group, userId);

  const target =
    getMember(group, memberId);

  if (!target) {
    throw new Error(
      "Target user is not a member of this group"
    );
  }

  // User cannot remove himself using this API.
  if (
    userId.toString() ===
    memberId.toString()
  ) {
    throw new Error(
      "Use leave group to remove yourself"
    );
  }

  if (
    group.settings.onlyAdminsCanRemoveMembers
  ) {
    if (requester.role !== "admin") {
      throw new Error(
        "Only group admins can remove members"
      );
    }
  }

  // Member cannot remove admin.
  if (
    requester.role !== "admin" &&
    target.role === "admin"
  ) {
    throw new Error(
      "Members cannot remove group admins"
    );
  }

  target.leftAt = new Date();

  await group.save();

  await populateGroup(group);

  return group;
};

// =====================================================
// LEAVE GROUP
// =====================================================

export const leaveGroup = async ({
  userId,
  groupId,
}) => {
  const group = await findGroup(groupId);

  const member =
    getMember(group, userId);

  if (!member) {
    throw new Error(
      "You are not a member of this group"
    );
  }

  const activeMembers =
    group.members.filter(
      (item) => !item.leftAt
    );

  if (activeMembers.length === 1) {
    group.isActive = false;
    member.leftAt = new Date();

    await group.save();

    return {
      groupId: group._id,
      left: true,
      groupDeactivated: true,
    };
  }

  const wasAdmin =
    member.role === "admin";

  member.leftAt = new Date();
  member.role = "member";

  // If leaving admin is the only admin,
  // promote the oldest active member.
  if (wasAdmin) {
    const remainingAdmins =
      group.members.filter(
        (item) =>
          !item.leftAt &&
          item.role === "admin"
      );

    if (remainingAdmins.length === 0) {
      const nextAdmin =
        group.members
          .filter(
            (item) =>
              !item.leftAt &&
              item.user.toString() !==
                userId.toString()
          )
          .sort(
            (a, b) =>
              new Date(a.joinedAt) -
              new Date(b.joinedAt)
          )[0];

      if (nextAdmin) {
        nextAdmin.role = "admin";
      }
    }
  }

  await group.save();

  return {
    groupId: group._id,
    left: true,
    groupDeactivated: false,
  };
};

// =====================================================
// PROMOTE MEMBER
// =====================================================

export const promoteMember = async ({
  userId,
  groupId,
  memberId,
}) => {
  const group = await findGroup(groupId);

  requireAdmin(group, userId);

  const target =
    getMember(group, memberId);

  if (!target) {
    throw new Error(
      "Target user is not a member of this group"
    );
  }

  if (target.role === "admin") {
    throw new Error(
      "User is already an admin"
    );
  }

  target.role = "admin";

  await group.save();

  await populateGroup(group);

  return group;
};

// =====================================================
// DEMOTE MEMBER
// =====================================================

export const demoteMember = async ({
  userId,
  groupId,
  memberId,
}) => {
  const group = await findGroup(groupId);

  requireAdmin(group, userId);

  const target =
    getMember(group, memberId);

  if (!target) {
    throw new Error(
      "Target user is not a member of this group"
    );
  }

  if (target.role !== "admin") {
    throw new Error(
      "User is not an admin"
    );
  }

  if (
    target.user.toString() ===
    userId.toString()
  ) {
    throw new Error(
      "You cannot demote yourself"
    );
  }

  const adminCount =
    group.members.filter(
      (item) =>
        !item.leftAt &&
        item.role === "admin"
    ).length;

  if (adminCount <= 1) {
    throw new Error(
      "Group must have at least one admin"
    );
  }

  target.role = "member";

  await group.save();

  await populateGroup(group);

  return group;
};

// =====================================================
// UPDATE GROUP SETTINGS
// =====================================================

export const updateGroupSettings = async ({
  userId,
  groupId,
  onlyAdminsCanSendMessages,
  onlyAdminsCanEditInfo,
  onlyAdminsCanAddMembers,
  onlyAdminsCanRemoveMembers,
}) => {
  const group = await findGroup(groupId);

  requireAdmin(group, userId);

  if (
    onlyAdminsCanSendMessages !== undefined
  ) {
    group.settings.onlyAdminsCanSendMessages =
      onlyAdminsCanSendMessages;
  }

  if (
    onlyAdminsCanEditInfo !== undefined
  ) {
    group.settings.onlyAdminsCanEditInfo =
      onlyAdminsCanEditInfo;
  }

  if (
    onlyAdminsCanAddMembers !== undefined
  ) {
    group.settings.onlyAdminsCanAddMembers =
      onlyAdminsCanAddMembers;
  }

  if (
    onlyAdminsCanRemoveMembers !== undefined
  ) {
    group.settings.onlyAdminsCanRemoveMembers =
      onlyAdminsCanRemoveMembers;
  }

  await group.save();

  await populateGroup(group);

  return group;
};

// =====================================================
// MUTE / UNMUTE GROUP
// =====================================================

export const updateMuteStatus = async ({
  userId,
  groupId,
  isMuted,
}) => {
  const group = await findGroup(groupId);

  const member =
    requireMember(group, userId);

  member.isMuted = Boolean(isMuted);

  await group.save();

  return {
    groupId: group._id,
    userId,
    isMuted: member.isMuted,
  };
}; 