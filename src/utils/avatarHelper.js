/**
 * Helper function to get full avatar URL
 * @param {string} avatarUrl - The avatar URL from API (e.g., /storage/avatars/advisor_1_1763789269.jpg)
 * @returns {string|undefined} - Full URL if avatar exists, undefined otherwise
 */
export const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return undefined;
  }
  
  // If already a full URL, return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // Get base URL and remove trailing slash if exists
  let baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  baseUrl = baseUrl.replace(/\/+$/, '');
  
  // Ensure avatarUrl starts with single /
  const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  
  return `${baseUrl}${path}`;
};
