export const STORAGE_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  ROLE: 'user_role',
};

export function storeTokens({ access, refresh, role }) {
  if (access) localStorage.setItem(STORAGE_KEYS.ACCESS, access);
  if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH, refresh);
  if (role) localStorage.setItem(STORAGE_KEYS.ROLE, role);
}

export function clearAuth() {
  console.log("works");
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function getStoredRole() {
  return localStorage.getItem(STORAGE_KEYS.ROLE);
}

export function normalizeRole(role) {
  if (!role) return '';
  return role.toLowerCase().replace(/\s+/g, '_');
}

export function getRedirectPathForRole(role) {
  const normalized = normalizeRole(role);
  if (normalized === 'officer') return '/officer_sidebar';
  if (normalized === 'subsidy_provider') return '/sub';
  if (normalized === 'admin') return '/sidebar';
  return '/sidebar';
}

export function isOfficer() {
  return normalizeRole(getStoredRole()) === 'officer';
}
