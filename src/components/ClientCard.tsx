import { Phone, Mail, Car, History, Calendar } from 'lucide-react';
import { Client } from '@/types';
import { cn } from '@/lib/utils';
import { getClientAppointments, getServiceById } from '@/data/mockData';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  showHistory?: boolean;
}

export function ClientCard({ client, onClick, showHistory = true }: ClientCardProps) {
  const appointments = getClientAppointments(client.id);
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={cn(
        'w-full text-left bg-card border border-border/50 rounded-xl p-4 cursor-pointer',
        'hover:border-primary/30 hover:shadow-lg transition-all duration-200'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg uppercase shrink-0">
          {client.firstName[0]}{client.lastName[0]}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {client.firstName} {client.lastName}
          </h3>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{client.phone}</span>
          </div>
          
          {client.email && (
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Car className="w-3.5 h-3.5" />
              <span>{client.cars.length} {client.cars.length === 1 ? 'auto' : 'aut'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <History className="w-3.5 h-3.5" />
              <span>{completedAppointments.length} {completedAppointments.length === 1 ? 'wizyta' : 'wizyt'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cars with service count */}
      {client.cars.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
          {client.cars.map((car) => {
            const carAppointments = appointments.filter(a => a.carId === car.id && a.status === 'completed');
            return (
              <div 
                key={car.id}
                className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary/70" />
                  <span className="text-sm font-medium">{car.brand} {car.model}</span>
                  {car.color && (
                    <span className="text-xs text-muted-foreground">• {car.color}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {carAppointments.length} {carAppointments.length === 1 ? 'usługa' : 'usług'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent service history */}
      {showHistory && completedAppointments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Ostatnie usługi
          </p>
          <div className="space-y-1.5">
            {completedAppointments.slice(0, 2).map((apt) => {
              const service = getServiceById(apt.serviceId);
              const car = client.cars.find(c => c.id === apt.carId);
              return (
                <div key={apt.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-foreground font-medium truncate">{service?.name}</span>
                    <span className="text-muted-foreground shrink-0">({car?.brand} {car?.model})</span>
                  </div>
                  <span className="text-muted-foreground shrink-0">
                    {apt.date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}