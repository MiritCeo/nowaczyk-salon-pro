import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  'scheduled': { 
    label: 'Zaplanowana', 
    className: 'bg-status-scheduled/15 text-status-scheduled border-status-scheduled/40' 
  },
  'in-progress': { 
    label: 'W trakcie', 
    className: 'bg-status-in-progress/15 text-status-in-progress border-status-in-progress/40' 
  },
  'completed': { 
    label: 'Zakończona', 
    className: 'bg-status-completed/15 text-status-completed border-status-completed/40' 
  },
  'cancelled': { 
    label: 'Anulowana', 
    className: 'bg-status-cancelled/15 text-status-cancelled border-status-cancelled/40' 
  },
  'no-show': { 
    label: 'Nieobecność', 
    className: 'bg-status-no-show/15 text-status-no-show border-status-no-show/40' 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
