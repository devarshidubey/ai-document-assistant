import { AlertCircle, X } from 'lucide-react';

export default function AlertBanner({ message, onDismiss, variant = 'error' }) {
  if (!message) return null;

  const styles =
    variant === 'error'
      ? 'border-danger/30 bg-danger-muted text-danger'
      : 'border-success/30 bg-success/10 text-success';

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles}`}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 hover:opacity-70"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
