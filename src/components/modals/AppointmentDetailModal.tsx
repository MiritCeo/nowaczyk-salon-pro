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
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
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
  onStatusChange,
  onEdit,
  onDelete
}: AppointmentDetailModalProps) {
  if (!appointment) return null;
  const { user } = useAuth();
  const canSeePrices = user?.role === 'admin';

  // Użyj danych z appointment jeśli są dostępne
  const client = appointment.client || { firstName: '', lastName: '', phone: '', email: '' };
  const car = appointment.car || { brand: '', model: '', color: '', plateNumber: '' };
  const services = appointment.services && appointment.services.length > 0
    ? appointment.services
    : appointment.service
      ? [appointment.service]
      : [];
  const primaryService = services[0] || { name: '', description: '', duration: 0, price: 0 };
  const totalDuration = services.reduce((sum, service) => sum + (Number(service.duration) || 0), 0);
  const servicesTotalPrice = services.reduce((sum, service) => sum + (Number(service.price) || 0), 0);
  const extraCost = appointment.extraCost || 0;
  const basePrice = servicesTotalPrice > 0 ? servicesTotalPrice : (appointment.price || 0);
  const totalPrice = basePrice + extraCost;
  const employee = appointment.employee || null;

  if (!client || !car) return null;

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
              <p className="text-sm text-muted-foreground">{totalDuration} minut</p>
            </div>
            {canSeePrices && totalPrice > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{totalPrice.toFixed(2)} zł</p>
                <p className="text-sm text-muted-foreground">cena</p>
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  {services.length > 1 ? `Usługi (${services.length})` : primaryService.name || ''}
                </p>
                {services.length <= 1 && (
                  <p className="text-sm text-muted-foreground">{primaryService.description || ''}</p>
                )}
              </div>
            </div>
            {services.length > 1 && (
              <div className="space-y-2">
                {services.map((service, index) => (
                  <div key={`${service.name}-${index}`} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{service.name}</span>
                    <span className="text-muted-foreground">{service.duration ? `${service.duration} min` : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canSeePrices && (servicesTotalPrice > 0 || appointment.price || appointment.extraCost) && (
            <>
              <Separator />
              <div className="space-y-2">
                {servicesTotalPrice > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Suma usług</span>
                    <span className="font-medium text-foreground">{servicesTotalPrice.toFixed(2)} zł</span>
                  </div>
                )}
                {appointment.price && servicesTotalPrice === 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cena</span>
                    <span className="font-medium text-foreground">{appointment.price.toFixed(2)} zł</span>
                  </div>
                )}
                {appointment.extraCost && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dopłata</span>
                    <span className="font-medium text-foreground">{appointment.extraCost.toFixed(2)} zł</span>
                  </div>
                )}
                {totalPrice > 0 && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Razem</span>
                    <span className="font-semibold text-foreground">{totalPrice.toFixed(2)} zł</span>
                  </div>
                )}
              </div>
            </>
          )}

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
                    {client.firstName?.[0] || ''}{client.lastName?.[0] || ''}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client.firstName || ''} {client.lastName || ''}</p>
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
              <p className="font-medium text-foreground">{car.brand || ''} {car.model || ''}</p>
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
              {statusOptions.map((option) => {
                const isCurrent = appointment.status === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => onStatusChange?.(appointment.id, option.value)}
                    disabled={isCurrent}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                      isCurrent
                        ? 'bg-primary text-primary-foreground cursor-default opacity-80'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Zamknij
            </Button>
            {onDelete && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => appointment && onDelete(appointment)}
              >
                Usuń wizytę
              </Button>
            )}
            <Button
              className="flex-1 gradient-brand shadow-button"
              onClick={() => appointment && onEdit?.(appointment)}
              disabled={!onEdit}
            >
              Edytuj wizytę
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
