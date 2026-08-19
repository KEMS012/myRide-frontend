export function getApiMessage(err, fallback = "Something went wrong. Please try again.") {
  if (!err) return fallback;
  const message = String(err.message || err).toLowerCase();

  if (message.includes("permission") || message.includes("permission-denied")) {
    return "You don't have permission to do this. Please sign out and sign in again.";
  }
  if (message.includes("network") || message.includes("fetch") || message.includes("econnreset")) {
    return "Network error. Please check your internet connection and try again.";
  }
  if (message.includes("timeout") || message.includes("deadline")) {
    return "Request timed out. Please try again.";
  }
  if (message.includes("unavailable") || message.includes("service")) {
    return "Service temporarily unavailable. Please try again in a moment.";
  }
  if (message.includes("not-found") || message.includes("no profile") || message.includes("not found")) {
    return "The requested information was not found.";
  }
  if (message.includes("already-exists") || message.includes("duplicate")) {
    return "This record already exists.";
  }
  if (message.includes("invalid") || message.includes("bad request")) {
    return "Invalid input. Please check the information and try again.";
  }
  if (message.includes("auth") || message.includes("token") || message.includes("unauthorized")) {
    return "Please sign in to continue.";
  }
  if (message.includes("firebase")) {
    return "Having trouble connecting to our servers. Please check your internet and try again.";
  }

  return fallback;
}
