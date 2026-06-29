import { apiRequest } from './api';

export async function signup({ email, password }) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
}

export async function login({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
}
