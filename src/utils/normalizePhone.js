// =====================================================
// PHONE NUMBER NORMALIZATION
// =====================================================

// Normalize a phone number into a consistent searchable format.
//
// Examples:
// +91 98765 43210  -> 919876543210
// +91-98765-43210  -> 919876543210
// 919876543210     -> 919876543210
// 9876543210       -> 919876543210
//
// Current default is India (+91), which matches the
// current Aura Connect user base/use case.

export const normalizePhone = (phone) => {
  if (phone === null || phone === undefined) {
    return "";
  }

  let digits = String(phone).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // Remove international dialing prefix.
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // India 10-digit mobile number.
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // Already contains India country code.
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  // For other international numbers, keep the digits.
  return digits;
};

// =====================================================
// CREATE POSSIBLE PHONE VARIANTS
// =====================================================

export const getPhoneVariants = (phone) => {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return [];
  }

  const variants = new Set();

  variants.add(normalized);

  // India number without country code.
  if (
    normalized.length === 12 &&
    normalized.startsWith("91")
  ) {
    variants.add(normalized.slice(2));
  }

  // Common +91 representation.
  if (
    normalized.length === 12 &&
    normalized.startsWith("91")
  ) {
    variants.add(`+${normalized}`);
  }

  return [...variants];
};

// =====================================================
// NORMALIZE PHONE LIST
// =====================================================

export const normalizePhoneList = (phoneNumbers = []) => {
  if (!Array.isArray(phoneNumbers)) {
    return [];
  }

  const normalizedNumbers = phoneNumbers
    .map((phone) => normalizePhone(phone))
    .filter(Boolean);

  return [...new Set(normalizedNumbers)];
};  