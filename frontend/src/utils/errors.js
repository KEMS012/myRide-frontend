const ERROR_MAP = {
  "permission-denied": "You don't have permission to do this. Please sign out and sign in again.",
  "permission": "Permission denied. Please check your account access or contact support.",
  "network": "Network error. Please check your internet connection and try again.",
  "offline": "You're offline. Please check your internet connection.",
  "unavailable": "Service temporarily unavailable. Please try again in a moment.",
  "deadline-exceeded": "Request timed out. Please try again.",
  "not-found": "The requested information was not found.",
  "already-exists": "This record already exists.",
  "failed-precondition": "Operation failed. Please refresh and try again.",
  "resource-exhausted": "Too many requests. Please wait a moment and try again.",
  "invalid-argument": "Invalid input. Please check the information and try again.",
  "unauthenticated": "Please sign in to continue.",
  "internal": "Something went wrong on our end. Please try again or contact support.",
  "user-not-found": "Invalid email or password.",
  "wrong-password": "Invalid email or password.",
  "invalid-credential": "Invalid email or password.",
  "invalid-email": "Please enter a valid email.",
  "too-many-requests": "Too many attempts. Try again later.",
  "not-configured": "Firebase is not configured yet.",
};

export function getUserMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  const message = String(error.message || error).toLowerCase();
  for (const [key, friendly] of Object.entries(ERROR_MAP)) {
    if (message.includes(key)) return friendly;
  }
  if (message.includes("firebase")) {
    return "Having trouble connecting to our servers. Please check your internet and try again.";
  }
  if (message.includes("payment")) {
    return "Payment failed. Please check your payment method and try again.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Network error. Please check your internet connection.";
  }
  if (message.includes("cors")) {
    return "Unable to connect to the server. Please try again later.";
  }
  return fallback;
}

export function withRetry(fn, retries = 2, delay = 800) {
  return async (...args) => {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn(...args);
      } catch (err) {
        if (i === retries) throw err;
        await new Promise((r) => setTimeout(r, delay * (i + 1)));
      }
    }
  };
}
