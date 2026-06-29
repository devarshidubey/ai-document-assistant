import { getToken, clearToken, clearStoredUser } from '../utils/storage';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const handleUnauthorized = () => {
  clearToken();
  clearStoredUser();
  if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
    window.location.href = '/login';
  }
};

export async function apiRequest(path, options = {}) {
  const { token, skipAuth = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const authToken = token ?? getToken();
  if (!skipAuth && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new ApiError('Network error. Check your connection and try again.', 0);
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.errors?.[0]?.message ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
