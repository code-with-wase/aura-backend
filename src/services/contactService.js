import mongoose from "mongoose";

import Contact from "../models/Contact.js";
import User from "../models/User.js";

import {
  normalizePhone,
  normalizePhoneList,
  getPhoneVariants,
} from "../utils/normalizePhone.js";

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
    "_id name username email phone phoneNormalized avatar about isOnline lastSeen isVerified isActive"
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
// SYNC / MATCH PHONE CONTACTS
// =====================================================
//
// IMPORTANT:
// This function DOES NOT automatically add users
// to the owner's Aura contacts.
//
// It only finds which phone contacts already have
// Aura Connect accounts.
//
// The frontend can then show:
//
// User A       [Add]
// User B       [Add]
//
// When the user clicks Add, the existing addContact()
// function is used.
//
// This keeps the user's Aura contacts private and
// user-controlled.

export const syncPhoneContacts = async ({
  userId,
  phoneNumbers,
}) => {
  if (!Array.isArray(phoneNumbers)) {
    throw new Error("phoneNumbers must be an array");
  }

  if (phoneNumbers.length === 0) {
    return {
      matchedUsers: [],
      totalMatched: 0,
      totalSubmitted: 0,
    };
  }

  // Prevent unnecessarily huge contact payloads.
  if (phoneNumbers.length > 5000) {
    throw new Error(
      "You can sync a maximum of 5000 phone contacts at once"
    );
  }

  const normalizedNumbers =
    normalizePhoneList(phoneNumbers);

  if (normalizedNumbers.length === 0) {
    return {
      matchedUsers: [],
      totalMatched: 0,
      totalSubmitted: phoneNumbers.length,
    };
  }

  // ---------------------------------------------------
  // Create all useful variants.
  // ---------------------------------------------------

  const variants = new Set();

  for (const phone of normalizedNumbers) {
    const phoneVariants =
      getPhoneVariants(phone);

    phoneVariants.forEach((variant) => {
      variants.add(variant);
    });
  }

  const variantList = [...variants];

  // ---------------------------------------------------
  // Match normalized phone numbers first.
  // ---------------------------------------------------

  const normalizedUsers =
    await User.find({
      _id: {
        $ne: userId,
      },
      isActive: true,
      $or: [
        {
          phoneNormalized: {
            $in: normalizedNumbers,
          },
        },
        {
          phone: {
            $in: variantList,
          },
        },
      ],
    }).select(
      "_id name username email phone phoneNormalized avatar about isOnline lastSeen isVerified"
    );

  // ---------------------------------------------------
  // Fallback matching for old users whose
  // phoneNormalized field does not exist.
  //
  // This allows your existing database users to work
  // before they are migrated.
  // ---------------------------------------------------

  const unmatchedNormalizedNumbers =
    new Set(normalizedNumbers);

  for (const user of normalizedUsers) {
    const normalizedUserPhone =
      normalizePhone(
        user.phoneNormalized || user.phone
      );

    if (normalizedUserPhone) {
      unmatchedNormalizedNumbers.delete(
        normalizedUserPhone
      );
    }
  }

  let fallbackUsers = [];

  if (unmatchedNormalizedNumbers.size > 0) {
    const fallbackRegexes = [
      ...unmatchedNormalizedNumbers,
    ].map((number) => {
      // For Indian numbers, match the final 10 digits.
      if (
        number.length === 12 &&
        number.startsWith("91")
      ) {
        const lastTen = number.slice(2);

        return new RegExp(
          `(?:^|[^0-9])(?:91)?[^0-9]*${lastTen.slice(
            0,
            5
          )}[^0-9]*${lastTen.slice(5)}$`
        );
      }

      return new RegExp(
        number
          .split("")
          .map((digit) => `${digit}[^0-9]*`)
          .join("")
      );
    });

    fallbackUsers = await User.find({
      _id: {
        $ne: userId,
      },
      isActive: true,
      phone: {
        $in: fallbackRegexes,
      },
    }).select(
      "_id name username email phone phoneNormalized avatar about isOnline lastSeen isVerified"
    );
  }

  // ---------------------------------------------------
  // Merge and deduplicate users.
  // ---------------------------------------------------

  const userMap = new Map();

  [...normalizedUsers, ...fallbackUsers].forEach(
    (user) => {
      userMap.set(
        user._id.toString(),
        user
      );
    }
  );

  // ---------------------------------------------------
  // Check existing contact state.
  // ---------------------------------------------------

  const matchedUserIds = [
    ...userMap.values(),
  ].map((user) => user._id);

  const existingContacts =
    matchedUserIds.length > 0
      ? await Contact.find({
          owner: userId,
          contact: {
            $in: matchedUserIds,
          },
        }).select(
          "contact isBlocked"
        )
      : [];

  const contactMap = new Map(
    existingContacts.map((item) => [
      item.contact.toString(),
      item,
    ])
  );

  // ---------------------------------------------------
  // Return only matched Aura users.
  // ---------------------------------------------------

  const matchedUsers = [
    ...userMap.values(),
  ]
    .map((user) => {
      const relation =
        contactMap.get(
          user._id.toString()
        );

      return {
        user,
        isContact: !!relation,
        isBlocked:
          relation?.isBlocked || false,
      };
    })
    .filter(
      (item) => !item.isBlocked
    )
    .sort((a, b) =>
      a.user.name.localeCompare(
        b.user.name
      )
    );

  return {
    matchedUsers,
    totalMatched:
      matchedUsers.length,
    totalSubmitted:
      phoneNumbers.length,
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