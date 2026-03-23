export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return (
    Math.random().toString(36).substring(2) +
    Date.now().toString(36)
  );
}
