import { apiRequest } from './api';

export async function fetchTasks(workspaceId) {
  const data = await apiRequest(`/workspaces/${workspaceId}/dashboard/tasks`);
  return data.tasks ?? [];
}
