import {
  createGroup as createGroupService,
  getGroups as getGroupsService,
  getGroup as getGroupService,
  updateGroup as updateGroupService,
  addMembers as addMembersService,
  removeMember as removeMemberService,
  leaveGroup as leaveGroupService,
  promoteMember as promoteMemberService,
  demoteMember as demoteMemberService,
  updateGroupSettings as updateGroupSettingsService,
  updateMuteStatus as updateMuteStatusService,
} from "../services/groupService.js";

import {
  successResponse,
} from "../utils/response.js";

// =====================================================
// CREATE GROUP
// =====================================================

export const createGroup = async (
  req,
  res,
  next
) => {
  try {
    const body =
      req.validatedData?.body ||
      req.body;

    const group =
      await createGroupService({
        userId: req.user._id,
        ...body,
      });

    return successResponse(
      res,
      201,
      "Group created successfully",
      {
        group,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET MY GROUPS
// =====================================================

export const getGroups = async (
  req,
  res,
  next
) => {
  try {
    const groups =
      await getGroupsService({
        userId: req.user._id,
      });

    return successResponse(
      res,
      200,
      "Groups fetched successfully",
      {
        groups,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET SINGLE GROUP
// =====================================================

export const getGroup = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const group =
      await getGroupService({
        userId: req.user._id,
        groupId: params.groupId,
      });

    return successResponse(
      res,
      200,
      "Group fetched successfully",
      {
        group,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// UPDATE GROUP
// =====================================================

export const updateGroup = async (
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

    const group =
      await updateGroupService({
        userId: req.user._id,
        groupId: params.groupId,
        ...body,
      });

    return successResponse(
      res,
      200,
      "Group updated successfully",
      {
        group,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// ADD MEMBERS
// =====================================================

export const addMembers = async (
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

    const group =
      await addMembersService({
        userId: req.user._id,
        groupId: params.groupId,
        memberIds: body.memberIds,
      });

    return successResponse(
      res,
      200,
      "Members added successfully",
      {
        group,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// REMOVE MEMBER
// =====================================================

export const removeMember = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const group =
      await removeMemberService({
        userId: req.user._id,
        groupId: params.groupId,
        memberId: params.userId,
      });

    return successResponse(
      res,
      200,
      "Member removed successfully",
      {
        group,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// LEAVE GROUP
// =====================================================

export const leaveGroup = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const result =
      await leaveGroupService({
        userId: req.user._id,
        groupId: params.groupId,
      });

    return successResponse(
      res,
      200,
      "Left group successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// PROMOTE MEMBER
// =====================================================

export const promoteMember = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const group =
      await promoteMemberService({
        userId: req.user._id,
        groupId: params.groupId,
        memberId: params.userId,
      });

    return successResponse(
      res,
      200,
      "Member promoted to admin successfully",
      {
        group,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// DEMOTE MEMBER
// =====================================================

export const demoteMember = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const group =
      await demoteMemberService({
        userId: req.user._id,
        groupId: params.groupId,
        memberId: params.userId,
      });

    return successResponse(
      res,
      200,
      "Admin demoted successfully",
      {
        group,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// UPDATE SETTINGS
// =====================================================

export const updateGroupSettings =
  async (req, res, next) => {
    try {
      const params =
        req.validatedData?.params ||
        req.params;

      const body =
        req.validatedData?.body ||
        req.body;

      const group =
        await updateGroupSettingsService({
          userId: req.user._id,
          groupId: params.groupId,
          ...body,
        });

      return successResponse(
        res,
        200,
        "Group settings updated successfully",
        {
          group,
        }
      );
    } catch (error) {
      return next(error);
    }
  };

// =====================================================
// MUTE / UNMUTE
// =====================================================

export const updateMuteStatus =
  async (req, res, next) => {
    try {
      const params =
        req.validatedData?.params ||
        req.params;

      const body =
        req.validatedData?.body ||
        req.body;

      const result =
        await updateMuteStatusService({
          userId: req.user._id,
          groupId: params.groupId,
          isMuted: body.isMuted,
        });

      return successResponse(
        res,
        200,
        body.isMuted
          ? "Group muted successfully"
          : "Group unmuted successfully",
        result
      );
    } catch (error) {
      return next(error);
    }
  }; 