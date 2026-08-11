import {
  getCurrentUser,
  getUserById,
  updateUserProfile,
  updatePrivacySettings,
  updateOnlineStatus,
  searchUsers,
} from "../services/userService.js";

import {
  successResponse,
} from "../utils/response.js";


// =====================================================
// GET CURRENT USER
// =====================================================

export const getMe = async (
  req,
  res,
  next
) => {
  try {
    const user = await getCurrentUser(
      req.user._id
    );

    return successResponse(
      res,
      200,
      "User profile fetched successfully",
      {
        user,
      }
    );
  } catch (error) {
    return next(error);
  }
};


// =====================================================
// GET USER BY ID
// =====================================================

export const getUser = async (
  req,
  res,
  next
) => {
  try {
    const user = await getUserById(
      req.params.userId
    );

    return successResponse(
      res,
      200,
      "User fetched successfully",
      {
        user,
      }
    );
  } catch (error) {
    return next(error);
  }
};


// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const user = await updateUserProfile(
      req.user._id,
      req.validatedData?.body || req.body
    );

    return successResponse(
      res,
      200,
      "Profile updated successfully",
      {
        user,
      }
    );
  } catch (error) {
    return next(error);
  }
};


// =====================================================
// UPDATE PRIVACY SETTINGS
// =====================================================

export const updatePrivacy = async (
  req,
  res,
  next
) => {
  try {
    const user = await updatePrivacySettings(
      req.user._id,
      req.validatedData?.body || req.body
    );

    return successResponse(
      res,
      200,
      "Privacy settings updated successfully",
      {
        privacy: user.privacy,
      }
    );
  } catch (error) {
    return next(error);
  }
};


// =====================================================
// UPDATE ONLINE STATUS
// =====================================================

export const updateStatus = async (
  req,
  res,
  next
) => {
  try {
    const { isOnline } =
      req.validatedData?.body || req.body;

    const user = await updateOnlineStatus(
      req.user._id,
      isOnline
    );

    return successResponse(
      res,
      200,
      "Online status updated successfully",
      {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      }
    );
  } catch (error) {
    return next(error);
  }
};


// =====================================================
// SEARCH USERS
// =====================================================

export const search = async (
  req,
  res,
  next
) => {
  try {
    const { search: searchValue } =
      req.validatedData?.query || req.query;

    const users = await searchUsers(
      searchValue,
      req.user._id
    );

    return successResponse(
      res,
      200,
      "Users fetched successfully",
      {
        users,
      }
    );
  } catch (error) {
    return next(error);
  }
};