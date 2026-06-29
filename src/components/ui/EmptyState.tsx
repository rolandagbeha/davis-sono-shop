import type { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-muted mb-4 opacity-50">
        {icon ?? <PackageOpen size={64} />}
      </div>
      <h3 className="text-xl font-heading font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-muted mb-6 max-w-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
