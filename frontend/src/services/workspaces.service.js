import { apiRequest } from './api';

export async function fetchWorkspaces() {
  const data = await apiRequest('/workspaces');
  return data.workspaces ?? [];
}

export async function createWorkspace(name) {
  const data = await apiRequest('/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return data.workspace;
}
