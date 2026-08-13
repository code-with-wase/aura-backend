import express from "express";

import {
  searchUsers,
  syncPhoneContacts,
  getContacts,
  addContact,
  removeContact,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getBlockStatus,
} from "../controllers/contactController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  validate,
} from "../middleware/validationMiddleware.js";

import {
  userIdSchema,
  searchContactsSchema,
  getContactsSchema,
  addContactSchema,
  removeContactSchema,
  blockContactSchema,
  syncPhoneContactsSchema,
} from "../schemas/contactSchemas.js";

const router = express.Router();

// =====================================================
// ALL CONTACT ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authMiddleware);

// =====================================================
// SEARCH USERS
// GET /contact/search?q=
// =====================================================

router.get(
  "/search",
  validate(searchContactsSchema),
  searchUsers
);

// =====================================================
// SYNC / MATCH PHONE CONTACTS
// POST /contact/sync
// =====================================================
//
// IMPORTANT:
// This route must stay BEFORE /:userId
// so "sync" is not treated as a userId.

router.post(
  "/sync",
  validate(syncPhoneContactsSchema),
  syncPhoneContacts
);

// =====================================================
// GET CONTACTS
// GET /contact
// =====================================================

router.get(
  "/",
  validate(getContactsSchema),
  getContacts
);

// =====================================================
// GET BLOCKED USERS
// GET /contact/blocked
// =====================================================

router.get(
  "/blocked",
  validate(getContactsSchema),
  getBlockedUsers
);

// =====================================================
// ADD CONTACT
// POST /contact/:userId
// =====================================================

router.post(
  "/:userId",
  validate(addContactSchema),
  addContact
);

// =====================================================
// REMOVE CONTACT
// DELETE /contact/:userId
// =====================================================

router.delete(
  "/:userId",
  validate(removeContactSchema),
  removeContact
);

// =====================================================
// BLOCK USER
// PATCH /contact/:userId/block
// =====================================================

router.patch(
  "/:userId/block",
  validate(blockContactSchema),
  blockUser
);

// =====================================================
// UNBLOCK USER
// PATCH /contact/:userId/unblock
// =====================================================

router.patch(
  "/:userId/unblock",
  validate(blockContactSchema),
  unblockUser
);

// =====================================================
// CHECK CONTACT / BLOCK STATUS
// GET /contact/:userId/status
// =====================================================

router.get(
  "/:userId/status",
  validate(userIdSchema),
  getBlockStatus
);

export default router;  