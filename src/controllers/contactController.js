import {
  searchUsers as searchUsersService,
  getContacts as getContactsService,
  addContact as addContactService,
  removeContact as removeContactService,
  blockUser as blockUserService,
  unblockUser as unblockUserService,
  getBlockedUsers as getBlockedUsersService,
  getBlockStatus as getBlockStatusService,
  syncPhoneContacts as syncPhoneContactsService,
} from "../services/contactService.js";

import {
  successResponse,
} from "../utils/response.js";

// =====================================================
// SEARCH USERS
// =====================================================

export const searchUsers = async (
  req,
  res,
  next
) => {
  try {
    const query =
      req.validatedData?.query ||
      req.query;

    const result =
      await searchUsersService({
        userId: req.user._id,
        query: query.q,
        page: query.page,
        limit: query.limit,
      });

    return successResponse(
      res,
      200,
      "Users fetched successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// SYNC / MATCH PHONE CONTACTS
// =====================================================

export const syncPhoneContacts = async (
  req,
  res,
  next
) => {
  try {
    const body =
      req.validatedData?.body ||
      req.body;

    const result =
      await syncPhoneContactsService({
        userId: req.user._id,
        phoneNumbers:
          body.phoneNumbers,
      });

    return successResponse(
      res,
      200,
      "Phone contacts synced successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET CONTACTS
// =====================================================

export const getContacts = async (
  req,
  res,
  next
) => {
  try {
    const query =
      req.validatedData?.query ||
      req.query;

    const result =
      await getContactsService({
        userId: req.user._id,
        page: query.page,
        limit: query.limit,
      });

    return successResponse(
      res,
      200,
      "Contacts fetched successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// ADD CONTACT
// =====================================================

export const addContact = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const contact =
      await addContactService({
        userId: req.user._id,
        contactUserId: params.userId,
      });

    return successResponse(
      res,
      201,
      "Contact added successfully",
      {
        contact,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// REMOVE CONTACT
// =====================================================

export const removeContact = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    await removeContactService({
      userId: req.user._id,
      contactUserId: params.userId,
    });

    return successResponse(
      res,
      200,
      "Contact removed successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// BLOCK USER
// =====================================================

export const blockUser = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const contact =
      await blockUserService({
        userId: req.user._id,
        contactUserId: params.userId,
      });

    return successResponse(
      res,
      200,
      "User blocked successfully",
      {
        contact,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// UNBLOCK USER
// =====================================================

export const unblockUser = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const contact =
      await unblockUserService({
        userId: req.user._id,
        contactUserId: params.userId,
      });

    return successResponse(
      res,
      200,
      "User unblocked successfully",
      {
        contact,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET BLOCKED USERS
// =====================================================

export const getBlockedUsers = async (
  req,
  res,
  next
) => {
  try {
    const query =
      req.validatedData?.query ||
      req.query;

    const result =
      await getBlockedUsersService({
        userId: req.user._id,
        page: query.page,
        limit: query.limit,
      });

    return successResponse(
      res,
      200,
      "Blocked users fetched successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET BLOCK STATUS
// =====================================================

export const getBlockStatus = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const result =
      await getBlockStatusService({
        userId: req.user._id,
        contactUserId: params.userId,
      });

    return successResponse(
      res,
      200,
      "Contact status fetched successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
}; 