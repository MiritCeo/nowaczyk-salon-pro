import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function KpiCard({ title, value, icon: Icon, trend, trendValue, className }: KpiCardProps) {
  return (
    <div className={cn(
      'rounded-xl p-5 bg-card border border-border/50 shadow-card card-automotive',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trendValue && (
            <p className={cn(
              'text-xs mt-1 font-medium',
              trend === 'up' && 'text-status-completed',
              trend === 'down' && 'text-status-no-show',
              trend === 'neutral' && 'text-muted-foreground'
            )}>
              {trendValue}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
