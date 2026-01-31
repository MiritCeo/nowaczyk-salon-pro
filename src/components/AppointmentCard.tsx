import { useEffect, useState } from 'react';
import { Clock, Car, Wrench, Phone, User } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getPaymentInfo } from '@/lib/payments';
import { appointmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  compact?: boolean;
  onOpenProtocol?: (appointment: Appointment) => void;
  onPaymentChange?: (id: string, paidAmount: number) => void;
}

export function AppointmentCard({ appointment, onClick, compact = false, onOpenProtocol, onPaymentChange }: AppointmentCardProps) {
  const { user } = useAuth();
  const canSeePrices = user?.role === 'admin';
  const { toast } = useToast();
  const [paidAmountInput, setPaidAmountInput] = useState('');
  const [isSavingPayment, setIsSavingPayment] = useState(false);
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
  const paymentInfo = canSeePrices ? getPaymentInfo(appointment) : null;
  const paymentStatusLabel = paymentInfo
    ? paymentInfo.status === 'paid'
      ? 'Opłacono'
      : paymentInfo.status === 'partial'
        ? 'Częściowo'
        : paymentInfo.isOverdue
          ? 'Zaległa'
          : 'Nieopłacona'
    : '';

  if (!client || !car) return null;

  useEffect(() => {
    setPaidAmountInput((appointment.paidAmount ?? 0).toString());
  }, [appointment.paidAmount]);

  const handleSavePayment = async () => {
    const amount = Number(paidAmountInput);
    if (!Number.isFinite(amount)) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Podaj poprawną kwotę.',
      });
      return;
    }
    if ((appointment.paidAmount ?? 0) === amount) {
      return;
    }
    try {
      setIsSavingPayment(true);
      await appointmentsAPI.updatePayment(appointment.id, amount);
      onPaymentChange?.(appointment.id, amount);
      toast({
        title: 'Zapisano',
        description: 'Kwota wpłaty została zapisana.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd zapisu',
        description: error.response?.data?.error || 'Nie udało się zapisać wpłaty.',
      });
    } finally {
      setIsSavingPayment(false);
    }
  };

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
        {onOpenProtocol && (
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              className="h-9 px-3 text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={(event) => {
                event.stopPropagation();
                onOpenProtocol(appointment);
              }}
            >
              Otwórz protokół
            </Button>
          </div>
        )}
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
      <div className="flex items-start justify-between mb-3 gap-3">
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

      {paymentInfo && totalPrice > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Status płatności</span>
            <span className={cn(
              'font-medium',
              paymentInfo.status === 'paid' && 'text-emerald-600',
              paymentInfo.status === 'partial' && 'text-amber-600',
              paymentInfo.status === 'unpaid' && paymentInfo.isOverdue && 'text-rose-600'
            )}>
              {paymentStatusLabel}
              {paymentInfo.isOverdue && paymentInfo.overdueDays > 0 && (
                <span className="ml-1">({paymentInfo.overdueDays} dni)</span>
              )}
            </span>
          </div>
          {paymentInfo.remaining > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Pozostało</span>
              <span className={cn(
                'font-medium',
                paymentInfo.isOverdue && 'text-rose-600'
              )}>
                {paymentInfo.remaining.toFixed(2)} zł
              </span>
            </div>
          )}
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                paymentInfo.status === 'paid' && 'bg-emerald-500',
                paymentInfo.status === 'partial' && 'bg-amber-500',
                paymentInfo.status === 'unpaid' && paymentInfo.isOverdue && 'bg-rose-500',
                paymentInfo.status === 'unpaid' && !paymentInfo.isOverdue && 'bg-muted-foreground/40'
              )}
              style={{ width: `${paymentInfo.progress}%` }}
            />
          </div>
          {!compact && canSeePrices && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="1"
                value={paidAmountInput}
                onChange={(event) => setPaidAmountInput(event.target.value)}
                onBlur={handleSavePayment}
                onClick={(event) => event.stopPropagation()}
                disabled={isSavingPayment}
                className="h-9"
              />
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSavePayment();
                }}
                disabled={isSavingPayment || Number(paidAmountInput) === (appointment.paidAmount ?? 0)}
              >
                Zapisz
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
        <a 
          href={`tel:${client.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Phone className="w-3.5 h-3.5" />
          Zadzwoń
        </a>
        {onOpenProtocol && (
          <Button
            size="sm"
            className="ml-auto h-9 px-3 text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={(event) => {
              event.stopPropagation();
              onOpenProtocol(appointment);
            }}
          >
            Otwórz protokół
          </Button>
        )}
      </div>
    </div>
  );
}
