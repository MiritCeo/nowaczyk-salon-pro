import { Clock, Car, Wrench, Phone, User } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment, onClick, compact = false }: AppointmentCardProps) {
  const { user } = useAuth();
  const canSeePrices = user?.role === 'admin';
  // Użyj danych z appointment jeśli są dostępne, w przeciwnym razie użyj ID
  const client = appointment.client || { firstName: '', lastName: '', phone: '' };
  const car = appointment.car || { brand: '', model: '', color: '' };
  const services = appointment.services && appointment.services.length > 0
    ? appointment.services
    : appointment.service
      ? [appointment.service]
      : [];
  const primaryService = services[0] || { name: '', duration: 0, price: 0 };
  const totalDuration = services.reduce((sum, service) => sum + (Number(service.duration) || 0), 0);
  const servicesTotalPrice = services.reduce((sum, service) => sum + (Number(service.price) || 0), 0);
  const extraCost = appointment.extraCost || 0;
  const basePrice = servicesTotalPrice > 0 ? servicesTotalPrice : (appointment.price || 0);
  const totalPrice = basePrice + extraCost;
  const serviceLabel = services.length > 1
    ? `${primaryService.name} +${services.length - 1}`
    : primaryService.name;

  if (!client || !car) return null;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-3 rounded-lg bg-card hover:bg-secondary/50 border border-border/50 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-primary font-semibold text-sm whitespace-nowrap">{appointment.startTime}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{client.firstName} {client.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{car.brand} {car.model}</p>
            </div>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={cn(
        'w-full text-left bg-card border border-border/50 rounded-xl p-4 shadow-card cursor-pointer',
        'hover:border-primary/30 transition-all duration-200 group card-automotive'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{appointment.startTime}</p>
            <p className="text-xs text-muted-foreground">
              {totalDuration} min
            </p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{client.firstName} {client.lastName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {car.brand} {car.model} · {car.color}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{serviceLabel}</span>
          {canSeePrices && totalPrice > 0 && (
            <span className="text-sm font-medium text-primary ml-auto">
              {totalPrice.toFixed(2)} zł
            </span>
          )}
        </div>
      </div>

      {appointment.notes && (
        <p className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground italic">
          {appointment.notes}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-border/50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a 
          href={`tel:${client.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Phone className="w-3.5 h-3.5" />
          Zadzwoń
        </a>
      </div>
    </div>
  );
}
