import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchWorkspaces, createWorkspace as createWorkspaceRequest } from '../services/workspaces.service';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await fetchWorkspaces();
      setWorkspaces(list);
    } catch (err) {
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const createWorkspace = useCallback(async (name) => {
    setError(null);
    const workspace = await createWorkspaceRequest(name);
    setWorkspaces((prev) => [...prev, workspace]);
    return workspace;
  }, []);

  const value = useMemo(
    () => ({
      workspaces,
      loading,
      error,
      loadWorkspaces,
      createWorkspace,
      setError,
    }),
    [workspaces, loading, error, loadWorkspaces, createWorkspace],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspaces() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspaces must be used within WorkspaceProvider');
  return ctx;
}
