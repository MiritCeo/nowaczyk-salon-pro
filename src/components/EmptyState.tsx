import { ReactNode } from 'react';
import { LucideIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-2xl bg-secondary/50 mb-4">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{description}</p>
      
      {action && (
        <Button onClick={action.onClick} className="gradient-brand shadow-button">
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
