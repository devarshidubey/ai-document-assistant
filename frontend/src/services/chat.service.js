import { API_BASE_URL, apiRequest, ApiError, handleUnauthorized } from './api';
import { getToken } from '../utils/storage';

/**
 * Streams chat responses via SSE using native fetch + ReadableStream.
 *
 * @param {string} workspaceId
 * @param {string} question
 * @param {{ onToken: (token: string) => void, onDone: (payload: object) => void, onError: (message: string) => void, signal?: AbortSignal }} handlers
 */
export async function streamChatMessage(workspaceId, question, handlers) {
  const { onToken, onDone, onError, signal } = handlers;
  const token = getToken();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ question }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') return;
    throw new ApiError('Network error. Check your connection and try again.', 0);
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      payload?.message || `Chat request failed (${response.status})`,
      response.status,
      payload,
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiError('Streaming is not supported by this browser.', 0);
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr) continue;

        let event;
        try {
          event = JSON.parse(jsonStr);
        } catch {
          continue;
        }

        if (event.type === 'token' && typeof event.token === 'string') {
          onToken(event.token);
        } else if (event.type === 'done') {
          onDone({
            citations: event.citations ?? [],
            groundedInDocuments: Boolean(event.groundedInDocuments),
          });
          return;
        } else if (event.type === 'error') {
          onError(event.message || 'Something went wrong generating a response.');
          return;
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    throw err;
  } finally {
    reader.releaseLock();
  }
}

export async function fetchChatHistory(workspaceId) {
  const data = await apiRequest(`/workspaces/${workspaceId}/dashboard/messages`);
  return data.messages ?? [];
}
