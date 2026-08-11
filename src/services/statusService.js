import Status from "../models/Status.js";
import User from "../models/User.js";

// =====================================================
// CONSTANTS
// =====================================================

const STATUS_DURATION_MS =
  24 * 60 * 60 * 1000;

// =====================================================
// POPULATE STATUS
// =====================================================

const populateStatus = async (status) => {
  await status.populate([
    {
      path: "user",
      select: "_id name username avatar",
    },
    {
      path: "viewers.user",
      select: "_id name username avatar",
    },
    {
      path: "sharedWith",
      select: "_id name username avatar",
    },
  ]);

  return status;
};

// =====================================================
// GET ACTIVE STATUS
// =====================================================

const findActiveStatus = async (statusId) => {
  const status = await Status.findOne({
    _id: statusId,
    isActive: true,
    expiresAt: {
      $gt: new Date(),
    },
  });

  if (!status) {
    throw new Error("Status not found or expired");
  }

  return status;
};

// =====================================================
// CHECK STATUS VISIBILITY
// =====================================================

const canViewStatus = (
  status,
  viewerId
) => {
  // Owner can always view own status.
  if (
    status.user.toString() ===
    viewerId.toString()
  ) {
    return true;
  }

  // Everyone
  if (status.privacy === "everyone") {
    return true;
  }

  // Only selected users
  if (
    status.privacy === "onlySharedWith"
  ) {
    return status.sharedWith.some(
      (userId) =>
        userId.toString() ===
        viewerId.toString()
    );
  }

  // Contacts privacy.
  //
  // Current User model does not contain
  // a contacts relationship, so we cannot
  // safely determine contact membership here.
  //
  // Therefore contacts-only status is not
  // exposed to another user until a contacts
  // relationship is available.
  return false;
};

// =====================================================
// CREATE STATUS
// =====================================================

export const createStatus = async ({
  userId,
  type,
  content = null,
  media = null,
  background = null,
  privacy = "contacts",
  sharedWith = [],
}) => {
  // ---------------------------------------------------
  // TEXT STATUS
  // ---------------------------------------------------

  if (type === "text") {
    if (
      !content ||
      !content.trim()
    ) {
      throw new Error(
        "Text status content is required"
      );
    }

    if (media?.url) {
      throw new Error(
        "Text status cannot contain media"
      );
    }
  }

  // ---------------------------------------------------
  // IMAGE / VIDEO STATUS
  // ---------------------------------------------------

  if (
    type === "image" ||
    type === "video"
  ) {
    if (
      !media ||
      !media.url ||
      !media.url.trim()
    ) {
      throw new Error(
        "Media URL is required for image or video status"
      );
    }
  }

  // ---------------------------------------------------
  // SHARED USERS
  // ---------------------------------------------------

  if (
    privacy === "onlySharedWith"
  ) {
    if (
      !Array.isArray(sharedWith) ||
      sharedWith.length === 0
    ) {
      throw new Error(
        "sharedWith is required for onlySharedWith privacy"
      );
    }
  }

  const uniqueSharedWith = [
    ...new Set(
      (sharedWith || []).map((id) =>
        id.toString()
      )
    ),
  ];

  if (uniqueSharedWith.length > 0) {
    const users = await User.find({
      _id: {
        $in: uniqueSharedWith,
      },
    }).select("_id");

    if (
      users.length !==
      uniqueSharedWith.length
    ) {
      throw new Error(
        "One or more shared users were not found"
      );
    }
  }

  // ---------------------------------------------------
  // EXPIRATION
  // ---------------------------------------------------

  const expiresAt = new Date(
    Date.now() + STATUS_DURATION_MS
  );

  // ---------------------------------------------------
  // CREATE
  // ---------------------------------------------------

  const status = await Status.create({
    user: userId,
    type,
    content:
      type === "text"
        ? content.trim()
        : null,

    media:
      type === "text"
        ? null
        : media || null,

    background:
      type === "text"
        ? background || null
        : null,

    privacy,

    sharedWith:
      privacy === "onlySharedWith"
        ? uniqueSharedWith
        : [],

    expiresAt,

    isActive: true,
  });

  await populateStatus(status);

  return status;
};

// =====================================================
// GET MY STATUS
// =====================================================

export const getMyStatuses = async ({
  userId,
}) => {
  const statuses =
    await Status.find({
      user: userId,
      isActive: true,
      expiresAt: {
        $gt: new Date(),
      },
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "_id name username avatar",
      })
      .populate({
        path: "viewers.user",
        select: "_id name username avatar",
      })
      .populate({
        path: "sharedWith",
        select: "_id name username avatar",
      });

  return statuses;
};

// =====================================================
// GET AVAILABLE STATUSES
// =====================================================

export const getStatuses = async ({
  userId,
}) => {
  const statuses =
    await Status.find({
      isActive: true,
      expiresAt: {
        $gt: new Date(),
      },
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "_id name username avatar",
      })
      .populate({
        path: "viewers.user",
        select: "_id name username avatar",
      })
      .populate({
        path: "sharedWith",
        select: "_id name username avatar",
      });

  const visibleStatuses =
    statuses.filter((status) =>
      canViewStatus(
        status,
        userId
      )
    );

  return visibleStatuses;
};

// =====================================================
// GET SINGLE STATUS
// =====================================================

export const getStatus = async ({
  userId,
  statusId,
}) => {
  const status =
    await findActiveStatus(statusId);

  if (
    !canViewStatus(
      status,
      userId
    )
  ) {
    throw new Error(
      "You do not have permission to view this status"
    );
  }

  await populateStatus(status);

  return status;
};

// =====================================================
// MARK STATUS AS VIEWED
// =====================================================

export const viewStatus = async ({
  userId,
  statusId,
}) => {
  const status =
    await findActiveStatus(statusId);

  if (
    !canViewStatus(
      status,
      userId
    )
  ) {
    throw new Error(
      "You do not have permission to view this status"
    );
  }

  // Owner does not need to create a view.
  if (
    status.user.toString() ===
    userId.toString()
  ) {
    await populateStatus(status);

    return status;
  }

  const alreadyViewed =
    status.viewers.some(
      (viewer) =>
        viewer.user.toString() ===
        userId.toString()
    );

  if (!alreadyViewed) {
    status.viewers.push({
      user: userId,
      viewedAt: new Date(),
    });

    await status.save();
  }

  await populateStatus(status);

  return status;
};

// =====================================================
// DELETE STATUS
// =====================================================

export const deleteStatus = async ({
  userId,
  statusId,
}) => {
  const status =
    await Status.findOne({
      _id: statusId,
      user: userId,
      isActive: true,
    });

  if (!status) {
    throw new Error(
      "Status not found or you are not the owner"
    );
  }

  status.isActive = false;

  await status.save();

  return {
    statusId: status._id,
    deleted: true,
  };
};