import { ListTodo } from 'lucide-react';

export default function TasksTab() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
        <ListTodo className="h-7 w-7 text-text-muted" />
      </div>
      <h2 className="text-lg font-semibold text-text">Tasks coming soon</h2>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        Track action items and follow-ups extracted from your documents. This workspace view is
        ready for future task management features.
      </p>
    </div>
  );
}
