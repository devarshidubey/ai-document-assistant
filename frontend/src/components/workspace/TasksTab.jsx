import { useCallback, useEffect, useState } from 'react';
import { ListTodo, RefreshCw } from 'lucide-react';
import { fetchTasks } from '../../services/tasks.service';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import AlertBanner from '../ui/AlertBanner';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function TasksTab({ workspaceId, refreshKey = 0 }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchTasks(workspaceId);
      setTasks(list);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, refreshKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Tasks</h2>
          <p className="text-sm text-text-muted">
            Action items saved in this workspace, including those created by the assistant.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadTasks} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin-slow' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && <AlertBanner message={error} onDismiss={() => setError(null)} />}

      {loading && tasks.length === 0 ? (
        <div className="py-8">
          <Spinner label="Loading tasks..." />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <ListTodo className="mx-auto mb-3 h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-muted">No tasks yet</p>
          <p className="mt-1 text-xs text-text-muted">
            Ask the assistant to save a task and it will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => (
                <tr key={task.id} className="bg-surface hover:bg-surface-elevated">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 shrink-0 text-accent" />
                      <span className="font-medium text-text">{task.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(task.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
