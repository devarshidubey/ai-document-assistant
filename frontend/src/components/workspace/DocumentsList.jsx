import { FileText, RefreshCw } from 'lucide-react';
import { fetchDocuments } from '../../services/documents.service';
import { useCallback, useEffect, useState } from 'react';
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

export default function DocumentsList({ workspaceId, refreshKey = 0 }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchDocuments(workspaceId);
      setDocuments(list);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">All documents</h3>
        <Button variant="ghost" size="sm" onClick={loadDocuments} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin-slow' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && <AlertBanner message={error} onDismiss={() => setError(null)} />}

      {loading && documents.length === 0 ? (
        <div className="py-8">
          <Spinner label="Loading documents..." />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-muted">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Filename</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => (
                <tr key={doc.id} className="bg-surface hover:bg-surface-elevated">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-accent" />
                      <span className="truncate font-medium text-text">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(doc.uploaded_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
