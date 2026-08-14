import User from "../models/User.js";

// =====================================================
// GET CURRENT USER PROFILE
// =====================================================

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select(
    "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy createdAt updatedAt"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// =====================================================
// GET USER BY ID
// =====================================================

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select(
    "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy createdAt updatedAt"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// =====================================================
// UPDATE USER PROFILE
// =====================================================

export const updateUserProfile = async (
  userId,
  updateData
) => {
  const allowedFields = [
    "name",
    "username",
    "about",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  // -----------------------------------------
  // USERNAME
  // -----------------------------------------

  if (updates.username) {
    updates.username = updates.username
      .trim()
      .toLowerCase();

    const existingUsername = await User.findOne({
      username: updates.username,
      _id: { $ne: userId },
    });

    if (existingUsername) {
      throw new Error(
        "Username is already registered"
      );
    }
  }

  // -----------------------------------------
  // USER
  // -----------------------------------------

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select(
    "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy createdAt updatedAt"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// =====================================================
// UPDATE PRIVACY SETTINGS
// =====================================================

export const updatePrivacySettings = async (
  userId,
  privacyData
) => {
  const allowedFields = [
    "lastSeen",
    "profilePhoto",
    "about",
    "readReceipts",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (privacyData[field] !== undefined) {
      updates[`privacy.${field}`] =
        privacyData[field];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select(
    "_id name username email phone avatar about isOnline lastSeen isVerified isActive privacy"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// =====================================================
// UPDATE ONLINE STATUS
// =====================================================

export const updateOnlineStatus = async (
  userId,
  isOnline
) => {
  const updateData = {
    isOnline: Boolean(isOnline),
  };

  // ---------------------------------------------------
  // IMPORTANT:
  // lastSeen is updated ONLY when going offline.
  // When coming online, the previous lastSeen is kept.
  // ---------------------------------------------------

  if (!isOnline) {
    updateData.lastSeen = new Date();
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select(
    "_id name username isOnline lastSeen"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// =====================================================
// SEARCH USERS
// =====================================================

export const searchUsers = async (
  search,
  currentUserId
) => {
  if (!search || !search.trim()) {
    return [];
  }

  const searchValue = search.trim();

  const users = await User.find({
    _id: {
      $ne: currentUserId,
    },

    isActive: true,

    $or: [
      {
        name: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        username: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        email: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ],
  })
    .select(
      "_id name username email phone avatar about isOnline lastSeen isVerified"
    )
    .limit(20);

  return users;
}; 