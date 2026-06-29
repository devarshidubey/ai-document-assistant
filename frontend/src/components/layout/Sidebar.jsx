import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FolderPlus,
  LogOut,
  Folder,
  ChevronRight,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspaces } from '../../context/WorkspaceContext';
import { validateWorkspaceName } from '../../utils/validation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import AlertBanner from '../ui/AlertBanner';
import ThemeToggle from '../ui/ThemeToggle';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { workspaces, loading, error, createWorkspace, setError } = useWorkspaces();
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [nameError, setNameError] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    const validationError = validateWorkspaceName(workspaceName);
    setNameError(validationError);
    if (validationError) return;

    setCreating(true);
    try {
      const workspace = await createWorkspace(workspaceName.trim());
      setModalOpen(false);
      setWorkspaceName('');
      navigate(`/workspaces/${workspace.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface-elevated">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold tracking-wide text-text">Doc Assistant</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-muted">
            <User className="h-4 w-4 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{user?.email}</p>
            <p className="text-xs text-text-muted">Signed in</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      <div className="p-4">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => {
            setModalOpen(true);
            setNameError(null);
            setError(null);
          }}
        >
          <FolderPlus className="h-4 w-4" />
          Create New Workspace
        </Button>
      </div>

      {error && (
        <div className="px-4 pb-2">
          <AlertBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          Workspaces
        </p>
        {loading ? (
          <div className="px-2 py-4">
            <Spinner label="Loading workspaces..." size="sm" />
          </div>
        ) : workspaces.length === 0 ? (
          <p className="px-2 py-2 text-sm text-text-muted">No workspaces yet</p>
        ) : (
          <ul className="space-y-0.5">
            {workspaces.map((ws) => {
              const active = workspaceId === ws.id;
              return (
                <li key={ws.id}>
                  <Link
                    to={`/workspaces/${ws.id}`}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-accent-muted font-medium text-accent'
                        : 'text-text hover:bg-surface-muted'
                    }`}
                  >
                    <Folder className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">{ws.name}</span>
                    {active && <ChevronRight className="h-4 w-4 shrink-0" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create workspace">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Workspace name"
            name="workspaceName"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            error={nameError}
            placeholder="Research papers, Q4 reports..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}
