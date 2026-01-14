import { Plus, UserPlus, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Plus;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface QuickActionsProps {
  onNewAppointment: () => void;
  onNewClient: () => void;
  onNotify: () => void;
}

export function QuickActions({ onNewAppointment, onNewClient, onNotify }: QuickActionsProps) {
  const actions: QuickAction[] = [
    { id: 'appointment', label: 'Wizyta', icon: Plus, onClick: onNewAppointment, variant: 'primary' },
    { id: 'client', label: 'Klient', icon: UserPlus, onClick: onNewClient },
    { id: 'notify', label: 'Powiadom', icon: Bell, onClick: onNotify },
  ];

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            action.variant === 'primary' 
              ? 'gradient-brand text-primary-foreground shadow-button hover:shadow-glow'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          <action.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
