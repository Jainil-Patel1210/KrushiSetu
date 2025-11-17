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

export const clearAuth = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_role");
    localStorage.setItem("isLoggedOut", "true");

    // Remove after 1 second: prevents auto-login immediately after redirect
    setTimeout(() => {
        localStorage.removeItem("isLoggedOut");
    }, 1200);
};


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

export function formatDate(dateStr) {
  if (!dateStr) return "N/A";

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
