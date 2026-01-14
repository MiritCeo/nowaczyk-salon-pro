import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  'scheduled': { 
    label: 'Zaplanowana', 
    className: 'bg-primary/20 text-primary border-primary/30' 
  },
  'in-progress': { 
    label: 'W trakcie', 
    className: 'bg-status-in-progress/20 text-status-in-progress border-status-in-progress/30' 
  },
  'completed': { 
    label: 'Zakończona', 
    className: 'bg-status-completed/20 text-status-completed border-status-completed/30' 
  },
  'cancelled': { 
    label: 'Anulowana', 
    className: 'bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30' 
  },
  'no-show': { 
    label: 'Nieobecność', 
    className: 'bg-status-no-show/20 text-status-no-show border-status-no-show/30' 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
