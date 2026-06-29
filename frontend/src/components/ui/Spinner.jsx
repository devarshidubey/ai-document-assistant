import { Loader2 } from 'lucide-react';

export default function Spinner({ label, size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';

  return (
    <div className={`flex items-center gap-2 text-text-muted ${className}`}>
      <Loader2 className={`${sizeClass} animate-spin-slow text-accent`} aria-hidden="true" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
