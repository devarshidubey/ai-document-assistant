const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed',
  secondary:
    'bg-surface-muted text-text border border-border hover:bg-surface-elevated disabled:opacity-60',
  ghost: 'text-text-muted hover:bg-surface-muted hover:text-text disabled:opacity-60',
  danger: 'bg-danger text-white hover:opacity-90 disabled:opacity-60',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-accent ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
