/**
 * Helper function to get full avatar URL
 * @param {string} avatarUrl - The avatar URL from API (e.g., /storage/avatars/advisor_1_1763786752.jpg)
 * @returns {string|undefined} - Full URL if avatar exists, undefined otherwise
 */
export const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return undefined;
  }
  return `http://localhost:8000${avatarUrl}`;
};
