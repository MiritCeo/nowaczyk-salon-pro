import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Phone, Mail, Car, Clock, User, Wrench, Calendar, MapPin, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { Appointment, AppointmentStatus } from '@/types';
import { getClientById, getCarById, getServiceById, getEmployeeById } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
}

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Zaplanowana' },
  { value: 'in-progress', label: 'W trakcie' },
  { value: 'completed', label: 'Zakończona' },
  { value: 'cancelled', label: 'Anulowana' },
  { value: 'no-show', label: 'Nieobecność' },
];

export function AppointmentDetailModal({ 
  appointment, 
  open, 
  onClose,
  onStatusChange 
}: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const client = getClientById(appointment.clientId);
  const car = getCarById(appointment.carId);
  const service = getServiceById(appointment.serviceId);
  const employee = appointment.employeeId ? getEmployeeById(appointment.employeeId) : null;

  if (!client || !car || !service) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">Szczegóły wizyty</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(appointment.date, 'EEEE, d MMMM yyyy', { locale: pl })}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Time & Service */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary">{appointment.startTime}</p>
              <p className="text-sm text-muted-foreground">{service.duration} minut</p>
            </div>
            {appointment.price && (
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{appointment.price} zł</p>
                <p className="text-sm text-muted-foreground">cena</p>
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Client Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Klient
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {client.firstName[0]}{client.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client.firstName} {client.lastName}</p>
                    <p className="text-sm text-muted-foreground">Klient</p>
                  </div>
                </div>
              </div>

              {/* Contact buttons */}
              <div className="flex gap-2">
                <a 
                  href={`tel:${client.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </a>
                {client.email && (
                  <a 
                    href={`mailto:${client.email}`}
                    className="flex items-center justify-center px-4 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Car Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Car className="w-4 h-4" />
              Pojazd
            </h3>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium text-foreground">{car.brand} {car.model}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                {car.plateNumber && <span>{car.plateNumber}</span>}
                {car.color && (
                  <>
                    <span>•</span>
                    <span>{car.color}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Employee */}
          {employee && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Pracownik</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-sm">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-foreground">{employee.name}</p>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notatki
                </h3>
                <p className="text-muted-foreground text-sm p-3 rounded-lg bg-muted/50">
                  {appointment.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Status Change */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Zmień status</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onStatusChange?.(appointment.id, option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    appointment.status === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Zamknij
            </Button>
            <Button className="flex-1 gradient-brand shadow-button">
              Edytuj wizytę
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
