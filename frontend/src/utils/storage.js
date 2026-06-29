const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const THEME_KEY = 'theme';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user) =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const clearStoredUser = () => localStorage.removeItem(USER_KEY);

export const getTheme = () => localStorage.getItem(THEME_KEY) || 'system';

export const setTheme = (theme) => localStorage.setItem(THEME_KEY, theme);
