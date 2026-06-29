import { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentsList from './DocumentsList';

export default function DocumentsTab({ workspaceId }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text">Upload documents</h2>
        <DocumentUpload
          workspaceId={workspaceId}
          onUploaded={() => setRefreshKey((k) => k + 1)}
        />
      </section>

      <section>
        <DocumentsList workspaceId={workspaceId} refreshKey={refreshKey} />
      </section>
    </div>
  );
}
