export default function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors ${
          error
            ? 'border-danger focus-visible:outline-danger'
            : 'border-border focus-visible:border-accent'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
