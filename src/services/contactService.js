import mongoose from "mongoose";

import Contact from "../models/Contact.js";
import User from "../models/User.js";

// =====================================================
// POPULATE CONTACT
// =====================================================

const populateContact = async (contact) => {
  await contact.populate({
    path: "contact",
    select: "_id name username email phone avatar about isOnline lastSeen isVerified",
  });

  return contact;
};

// =====================================================
// CHECK USER
// =====================================================

const checkUserExists = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findById(userId).select(
    "_id name username email phone avatar about isOnline lastSeen isVerified isActive"
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive");
  }

  return user;
};

// =====================================================
// SEARCH USERS
// =====================================================

export const searchUsers = async ({
  userId,
  query,
  page = 1,
  limit = 20,
}) => {
  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip = (pageNumber - 1) * limitNumber;

  const search = String(query).trim();

  if (!search) {
    throw new Error("Search query is required");
  }

  const regex = new RegExp(
    search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i"
  );

  const filter = {
    _id: {
      $ne: userId,
    },
    isActive: true,
    $or: [
      {
        name: regex,
      },
      {
        username: regex,
      },
      {
        phone: regex,
      },
      {
        email: regex,
      },
    ],
  };

  const [users, totalUsers] = await Promise.all([
    User.find(filter)
      .select(
        "_id name username email phone avatar about isOnline lastSeen isVerified"
      )
      .sort({
        name: 1,
      })
      .skip(skip)
      .limit(limitNumber),

    User.countDocuments(filter),
  ]);

  // Check contact/block state
  const userIds = users.map((user) => user._id);

  const contacts = await Contact.find({
    owner: userId,
    contact: {
      $in: userIds,
    },
  }).select("contact isBlocked");

  const contactMap = new Map(
    contacts.map((item) => [
      item.contact.toString(),
      item,
    ])
  );

  const results = users.map((user) => {
    const relation = contactMap.get(
      user._id.toString()
    );

    return {
      user,
      isContact: !!relation,
      isBlocked: relation?.isBlocked || false,
    };
  });

  const totalPages = Math.ceil(
    totalUsers / limitNumber
  );

  return {
    users: results,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalUsers,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  };
};

// =====================================================
// GET CONTACTS
// =====================================================

export const getContacts = async ({
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

  const filter = {
    owner: userId,
    isBlocked: false,
  };

  const [contacts, totalContacts] =
    await Promise.all([
      Contact.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .populate({
          path: "contact",
          select:
            "_id name username email phone avatar about isOnline lastSeen isVerified",
        }),

      Contact.countDocuments(filter),
    ]);

  const totalPages = Math.ceil(
    totalContacts / limitNumber
  );

  return {
    contacts,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalContacts,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  };
};

// =====================================================
// ADD CONTACT
// =====================================================

export const addContact = async ({
  userId,
  contactUserId,
}) => {
  if (
    userId.toString() ===
    contactUserId.toString()
  ) {
    throw new Error(
      "You cannot add yourself as a contact"
    );
  }

  await checkUserExists(contactUserId);

  const existingContact =
    await Contact.findOne({
      owner: userId,
      contact: contactUserId,
    });

  if (existingContact) {
    if (existingContact.isBlocked) {
      throw new Error(
        "This user is currently blocked. Unblock the user first."
      );
    }

    throw new Error(
      "User is already in your contacts"
    );
  }

  const contact = await Contact.create({
    owner: userId,
    contact: contactUserId,
    isBlocked: false,
    blockedAt: null,
  });

  await populateContact(contact);

  return contact;
};

// =====================================================
// REMOVE CONTACT
// =====================================================

export const removeContact = async ({
  userId,
  contactUserId,
}) => {
  const contact =
    await Contact.findOneAndDelete({
      owner: userId,
      contact: contactUserId,
    });

  if (!contact) {
    throw new Error(
      "Contact not found"
    );
  }

  return contact;
};

// =====================================================
// BLOCK USER
// =====================================================

export const blockUser = async ({
  userId,
  contactUserId,
}) => {
  if (
    userId.toString() ===
    contactUserId.toString()
  ) {
    throw new Error(
      "You cannot block yourself"
    );
  }

  await checkUserExists(contactUserId);

  let contact = await Contact.findOne({
    owner: userId,
    contact: contactUserId,
  });

  if (!contact) {
    contact = await Contact.create({
      owner: userId,
      contact: contactUserId,
      isBlocked: true,
      blockedAt: new Date(),
    });
  } else {
    if (contact.isBlocked) {
      throw new Error(
        "User is already blocked"
      );
    }

    contact.isBlocked = true;
    contact.blockedAt = new Date();

    await contact.save();
  }

  await populateContact(contact);

  return contact;
};

// =====================================================
// UNBLOCK USER
// =====================================================

export const unblockUser = async ({
  userId,
  contactUserId,
}) => {
  const contact = await Contact.findOne({
    owner: userId,
    contact: contactUserId,
  });

  if (!contact) {
    throw new Error(
      "Contact not found"
    );
  }

  if (!contact.isBlocked) {
    throw new Error(
      "User is not blocked"
    );
  }

  contact.isBlocked = false;
  contact.blockedAt = null;

  await contact.save();

  await populateContact(contact);

  return contact;
};

// =====================================================
// GET BLOCKED USERS
// =====================================================

export const getBlockedUsers = async ({
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

  const filter = {
    owner: userId,
    isBlocked: true,
  };

  const [blockedUsers, totalBlocked] =
    await Promise.all([
      Contact.find(filter)
        .sort({
          blockedAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .populate({
          path: "contact",
          select:
            "_id name username email phone avatar about isOnline lastSeen isVerified",
        }),

      Contact.countDocuments(filter),
    ]);

  const totalPages = Math.ceil(
    totalBlocked / limitNumber
  );

  return {
    blockedUsers,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalBlocked,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  };
};

// =====================================================
// CHECK BLOCK STATUS
// =====================================================

export const getBlockStatus = async ({
  userId,
  contactUserId,
}) => {
  await checkUserExists(contactUserId);

  const contact = await Contact.findOne({
    owner: userId,
    contact: contactUserId,
  }).populate({
    path: "contact",
    select:
      "_id name username email phone avatar about isOnline lastSeen isVerified",
  });

  return {
    isContact: !!contact,
    isBlocked: contact?.isBlocked || false,
    contact: contact || null,
  };
};  