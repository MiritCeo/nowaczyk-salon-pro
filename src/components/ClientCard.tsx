import { Phone, Mail, Car, Calendar } from 'lucide-react';
import { Client } from '@/types';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={cn(
        'w-full text-left bg-card border border-border/50 rounded-xl p-4 shadow-card cursor-pointer card-automotive',
        'hover:border-primary/30 transition-all duration-200'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg uppercase">
          {client.firstName[0]}{client.lastName[0]}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {client.firstName} {client.lastName}
          </h3>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>{client.phone}</span>
          </div>
          
          {client.email && (
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Car className="w-3.5 h-3.5" />
              <span>{client.cars.length} {client.cars.length === 1 ? 'auto' : 'aut'}</span>
            </div>
          </div>
        </div>
      </div>

      {client.cars.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2">
          {client.cars.map((car) => (
            <span 
              key={car.id}
              className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs font-medium"
            >
              {car.brand} {car.model}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
