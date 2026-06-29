import { useCallback, useRef, useState } from 'react';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { uploadDocument } from '../../services/documents.service';
import { validateDocumentFile } from '../../utils/validation';
import Button from '../ui/Button';
import AlertBanner from '../ui/AlertBanner';
import Spinner from '../ui/Spinner';

export default function DocumentUpload({ workspaceId, onUploaded }) {
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [error, setError] = useState(null);

  const handleFile = useCallback(
    async (file) => {
      const validationError = validateDocumentFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setUploading(true);
      setUploadMessage('Uploading file...');

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setUploadMessage(
          'Ingesting document... processing text chunks. This may take a minute for large files.',
        );
        const result = await uploadDocument(workspaceId, file, { signal: controller.signal });

        if (result.status === 'already_exists') {
          setUploadMessage('Document already exists in this workspace.');
        } else {
          setUploadMessage(
            `Successfully ingested "${result.document?.filename}" (${result.chunkCount} chunks).`,
          );
        }

        onUploaded?.(result.document);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Upload failed');
        setUploadMessage('');
      } finally {
        setUploading(false);
        abortRef.current = null;
      }
    },
    [workspaceId, onUploaded],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-accent bg-accent-muted/50'
            : 'border-border bg-surface-elevated hover:border-border-strong'
        } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.md,application/pdf,text/markdown"
          className="sr-only"
          onChange={onFileChange}
          disabled={uploading}
        />

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted">
          {uploading ? (
            <FileUp className="h-6 w-6 text-accent" />
          ) : (
            <Upload className="h-6 w-6 text-accent" />
          )}
        </div>

        <p className="text-sm font-medium text-text">
          {uploading ? 'Processing your document' : 'Drag & drop a document here'}
        </p>
        <p className="mt-1 text-xs text-text-muted">PDF or Markdown · max 10 MB</p>

        {!uploading && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
        )}
      </div>

      {uploading && (
        <div className="rounded-lg border border-accent/30 bg-accent-muted/30 p-4">
          <Spinner label={uploadMessage} size="lg" />
          <div className="mt-3 flex items-start gap-2 text-xs text-text-muted">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Embedding runs in 100-chunk batches with cooldown periods. Large documents may
              take several minutes — please keep this tab open.
            </p>
          </div>
        </div>
      )}

      {!uploading && uploadMessage && (
        <AlertBanner message={uploadMessage} variant="success" onDismiss={() => setUploadMessage('')} />
      )}

      {error && <AlertBanner message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}
