import { API_BASE_URL, apiRequest, ApiError, handleUnauthorized } from './api';
import { getToken } from '../utils/storage';

export async function fetchDocuments(workspaceId) {
  const data = await apiRequest(`/workspaces/${workspaceId}/dashboard/documents`);
  return data.documents ?? [];
}

export async function uploadDocument(workspaceId, file, { signal } = {}) {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/documents`, {
      method: 'POST',
      headers,
      body: formData,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Network error during upload. Please try again.', 0);
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Upload failed (${response.status})`,
      response.status,
      payload,
    );
  }

  return payload;
}
