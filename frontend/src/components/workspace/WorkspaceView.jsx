import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, ListTodo } from 'lucide-react';
import { useWorkspaces } from '../../context/WorkspaceContext';
import DocumentsTab from './DocumentsTab';
import TasksTab from './TasksTab';
import ChatPanel from '../chat/ChatPanel';

const TABS = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
];

export default function WorkspaceView() {
  const { workspaceId } = useParams();
  const { workspaces } = useWorkspaces();
  const [activeTab, setActiveTab] = useState('documents');

  const workspace = useMemo(
    () => workspaces.find((ws) => ws.id === workspaceId),
    [workspaces, workspaceId],
  );

  return (
    <div className="flex h-full min-w-0">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-border bg-surface px-6 py-4">
          <h1 className="text-xl font-bold text-text">{workspace?.name ?? 'Workspace'}</h1>
          <p className="text-sm text-text-muted">Manage documents and collaborate with AI</p>

          <nav className="mt-4 flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-accent-muted text-accent'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'documents' && <DocumentsTab workspaceId={workspaceId} />}
          {activeTab === 'tasks' && <TasksTab />}
        </div>
      </div>

      <ChatPanel workspaceId={workspaceId} />
    </div>
  );
}
