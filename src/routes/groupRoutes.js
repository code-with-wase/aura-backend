import express from "express";

import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  addMembers,
  removeMember,
  leaveGroup,
  promoteMember,
  demoteMember,
  updateGroupSettings,
  updateMuteStatus,
} from "../controllers/groupController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  validate,
} from "../middleware/validationMiddleware.js";

import {
  createGroupSchema,
  groupIdSchema,
  updateGroupSchema,
  addMembersSchema,
  groupUserSchema,
  updateGroupSettingsSchema,
  muteGroupSchema,
} from "../schemas/groupSchemas.js";

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);

// =====================================================
// CREATE GROUP
// POST /group
// =====================================================

router.post(
  "/",
  validate(createGroupSchema),
  createGroup
);

// =====================================================
// GET MY GROUPS
// GET /group
// =====================================================

router.get(
  "/",
  getGroups
);

// =====================================================
// GET SINGLE GROUP
// GET /group/:groupId
// =====================================================

router.get(
  "/:groupId",
  validate(groupIdSchema),
  getGroup
);

// =====================================================
// UPDATE GROUP
// PATCH /group/:groupId
// =====================================================

router.patch(
  "/:groupId",
  validate(updateGroupSchema),
  updateGroup
);

// =====================================================
// ADD MEMBERS
// POST /group/:groupId/members
// =====================================================

router.post(
  "/:groupId/members",
  validate(addMembersSchema),
  addMembers
);

// =====================================================
// REMOVE MEMBER
// DELETE /group/:groupId/members/:userId
// =====================================================

router.delete(
  "/:groupId/members/:userId",
  validate(groupUserSchema),
  removeMember
);

// =====================================================
// LEAVE GROUP
// DELETE /group/:groupId/leave
// =====================================================

router.delete(
  "/:groupId/leave",
  validate(groupIdSchema),
  leaveGroup
);

// =====================================================
// PROMOTE MEMBER
// PATCH /group/:groupId/members/:userId/promote
// =====================================================

router.patch(
  "/:groupId/members/:userId/promote",
  validate(groupUserSchema),
  promoteMember
);

// =====================================================
// DEMOTE MEMBER
// PATCH /group/:groupId/members/:userId/demote
// =====================================================

router.patch(
  "/:groupId/members/:userId/demote",
  validate(groupUserSchema),
  demoteMember
);

// =====================================================
// UPDATE SETTINGS
// PATCH /group/:groupId/settings
// =====================================================

router.patch(
  "/:groupId/settings",
  validate(updateGroupSettingsSchema),
  updateGroupSettings
);

// =====================================================
// MUTE / UNMUTE
// PATCH /group/:groupId/mute
// =====================================================

router.patch(
  "/:groupId/mute",
  validate(muteGroupSchema),
  updateMuteStatus
); 

export default router;