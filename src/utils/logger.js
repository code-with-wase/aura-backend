const getTimestamp = () => {
  return new Date().toISOString();
};

export const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${getTimestamp()} - ${message}`, data || "");
  },

  success: (message, data = null) => {
    console.log(`[SUCCESS] ${getTimestamp()} - ${message}`, data || "");
  },

  warn: (message, data = null) => {
    console.warn(`[WARN] ${getTimestamp()} - ${message}`, data || "");
  },

  error: (message, error = null) => {
    console.error(
      `[ERROR] ${getTimestamp()} - ${message}`,
      error?.message || error || ""
    );
  },
};