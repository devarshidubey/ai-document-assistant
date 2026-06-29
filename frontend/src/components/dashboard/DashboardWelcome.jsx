import { FolderOpen, LayoutDashboard } from 'lucide-react';

export default function DashboardWelcome() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
        <LayoutDashboard className="h-8 w-8 text-accent" />
      </div>
      <h1 className="text-2xl font-bold text-text">Welcome to your dashboard</h1>
      <p className="mt-2 max-w-md text-text-muted">
        Select an existing workspace from the sidebar or create a new one to upload documents
        and chat with your AI assistant.
      </p>
      <div className="mt-8 flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-muted">
        <FolderOpen className="h-4 w-4 shrink-0" />
        <span>No workspace selected</span>
      </div>
    </div>
  );
}
