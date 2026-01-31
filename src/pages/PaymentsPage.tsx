import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CreditCard, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/KpiCard';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { appointmentsAPI, clientsAPI } from '@/services/api';
import { Appointment, AppointmentStatus, Client } from '@/types';
import { cn } from '@/lib/utils';
import { getPaymentInfo, PaymentStatus } from '@/lib/payments';
import { useToast } from '@/hooks/use-toast';

const paymentFilters: { value: 'all' | PaymentStatus | 'overdue'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'paid', label: 'Opłacone' },
  { value: 'partial', label: 'Częściowo' },
  { value: 'unpaid', label: 'Nieopłacone' },
  { value: 'overdue', label: 'Zaległe' },
];

const appointmentFilters: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'scheduled', label: 'Zaplanowane' },
  { value: 'in-progress', label: 'W trakcie' },
  { value: 'completed', label: 'Zakończone' },
  { value: 'cancelled', label: 'Anulowane' },
  { value: 'no-show', label: 'Nieobecność' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(value);

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

const getWeekStart = (date: Date) => {
  const current = startOfDay(date);
  const day = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - day);
  return current;
};

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const transformAppointment = (apt: any): Appointment => ({
  id: apt.id.toString(),
  clientId: apt.client_id.toString(),
  carId: apt.car_id.toString(),
  serviceId: apt.service_id ? apt.service_id.toString() : undefined,
  serviceIds: Array.isArray(apt.service_ids) ? apt.service_ids.map((id: any) => id.toString()) : undefined,
  employeeId: apt.employee_id ? apt.employee_id.toString() : undefined,
  date: new Date(apt.date),
  startTime: apt.start_time,
  status: apt.status as AppointmentStatus,
  notes: apt.notes || undefined,
  price: apt.price ? parseFloat(apt.price) : undefined,
  extraCost: apt.extra_cost ? parseFloat(apt.extra_cost) : undefined,
  paidAmount: apt.paid_amount ? parseFloat(apt.paid_amount) : undefined,
  client: apt.first_name ? {
    firstName: apt.first_name,
    lastName: apt.last_name,
    phone: apt.phone,
    email: apt.email,
  } : undefined,
  car: apt.brand ? {
    brand: apt.brand,
    model: apt.model,
    color: apt.color,
    plateNumber: apt.plate_number,
  } : undefined,
  services: Array.isArray(apt.services) ? apt.services.map((service: any) => ({
    id: service.id?.toString?.() ?? service.id,
    name: service.name,
    duration: service.duration,
    category: service.category,
    price: service.price ? parseFloat(service.price) : service.price,
    description: service.description,
  })) : undefined,
  service: apt.service_name ? {
    name: apt.service_name,
    duration: apt.duration,
    category: apt.category,
  } : undefined,
  employee: apt.employee_name ? {
    name: apt.employee_name,
    role: apt.employee_role,
  } : undefined,
});

export default function PaymentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [appointmentFilter, setAppointmentFilter] = useState<AppointmentStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus | 'overdue'>('all');
  const [paymentVersion, setPaymentVersion] = useState(0);
  const [draftPaidAmounts, setDraftPaidAmounts] = useState<Record<string, string>>({});
  const [outstandingRange, setOutstandingRange] = useState<[number, number]>([0, 0]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, clientsRes] = await Promise.all([
        appointmentsAPI.getAll(),
        clientsAPI.getAll(),
      ]);
      const mapped = (appointmentsRes.data.data || []).map(transformAppointment);
      setAppointments(mapped);
      const mappedClients = (clientsRes.data.data || []).map((client: any) => ({
        id: client.id.toString(),
        firstName: client.first_name,
        lastName: client.last_name,
        phone: client.phone,
        email: client.email || undefined,
        notes: client.notes || undefined,
        totalVisits: client.total_visits || 0,
        cars: (client.cars || []).map((car: any) => ({
          id: car.id.toString(),
          clientId: car.client_id.toString(),
          brand: car.brand,
          model: car.model,
          color: car.color,
          plateNumber: car.plate_number || undefined,
          notes: car.notes || undefined,
        })),
        createdAt: new Date(client.created_at),
      }));
      setClients(mappedClients);
    } catch (error: any) {
      console.error('Error fetching payments data:', error);
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać danych rozliczeń',
      });
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    const now = new Date();
    return appointments.map((appointment) => ({
      appointment,
      payment: getPaymentInfo(appointment, now),
    }));
  }, [appointments, paymentVersion]);

  useEffect(() => {
    setDraftPaidAmounts((prev) => {
      const next = { ...prev };
      rows.forEach(({ appointment, payment }) => {
        if (next[appointment.id] === undefined) {
          next[appointment.id] = payment.paidAmount.toString();
        }
      });
      return next;
    });
  }, [rows]);

  useEffect(() => {
    const maxOutstanding = rows.reduce((max, row) => Math.max(max, row.payment.remaining), 0);
    setOutstandingRange(([min, max]) => {
      if (max === 0 && min === 0) {
        return [0, Math.ceil(maxOutstanding)];
      }
      return [Math.min(min, maxOutstanding), Math.max(max, maxOutstanding)];
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter(({ appointment, payment }) => {
      if (clientFilter !== 'all' && appointment.clientId !== clientFilter) return false;
      if (appointmentFilter !== 'all' && appointment.status !== appointmentFilter) return false;
      if (paymentFilter !== 'all') {
        if (paymentFilter === 'overdue') {
          if (!payment.isOverdue) return false;
        } else if (payment.status !== paymentFilter) {
          return false;
        }
      }
      if (payment.remaining < outstandingRange[0] || payment.remaining > outstandingRange[1]) {
        return false;
      }
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const clientName = `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.toLowerCase();
      const serviceNames = appointment.services?.map((service) => service.name?.toLowerCase()).join(' ') || appointment.service?.name?.toLowerCase() || '';
      return clientName.includes(query) || serviceNames.includes(query) || appointment.startTime.includes(query);
    });
  }, [rows, clientFilter, appointmentFilter, paymentFilter, searchQuery, outstandingRange]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const weekStart = getWeekStart(now);
    const monthStart = getMonthStart(now);

    const getPaidValue = (payment: ReturnType<typeof getPaymentInfo>) => payment.paidAmount;

    const getOutstanding = (payment: ReturnType<typeof getPaymentInfo>) => payment.remaining;

    let todaySum = 0;
    let weekSum = 0;
    let monthSum = 0;
    let overdueSum = 0;
    let overdueCount = 0;

    rows.forEach(({ appointment, payment }) => {
      const appointmentDate = startOfDay(appointment.date);
      const paidValue = getPaidValue(payment);
      if (isSameDay(appointmentDate, today)) todaySum += paidValue;
      if (appointmentDate >= weekStart) weekSum += paidValue;
      if (appointmentDate >= monthStart) monthSum += paidValue;
      if (payment.isOverdue) {
        overdueSum += getOutstanding(payment);
        overdueCount += 1;
      }
    });

    return { todaySum, weekSum, monthSum, overdueSum, overdueCount };
  }, [rows]);

  const handlePaidAmountChange = (appointmentId: string, value: string) => {
    setDraftPaidAmounts((prev) => ({
      ...prev,
      [appointmentId]: value,
    }));
  };

  const handleSavePaidAmount = async (appointmentId: string) => {
    const raw = draftPaidAmounts[appointmentId] ?? '';
    const amount = Number(raw);
    if (!Number.isFinite(amount)) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Podaj poprawną kwotę.',
      });
      return;
    }
    const current = appointments.find((appointment) => appointment.id === appointmentId);
    if (current && Number(current.paidAmount || 0) === amount) {
      return;
    }
    try {
      await appointmentsAPI.updatePayment(appointmentId, amount);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, paidAmount: amount } : appointment
        )
      );
      setPaymentVersion((prev) => prev + 1);
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
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold page-title">Rozliczenia</h1>
          <p className="text-muted-foreground">Monitoruj status płatności za wizyty</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Dzisiaj" value={formatCurrency(stats.todaySum)} icon={TrendingUp} />
          <KpiCard title="Ten tydzień" value={formatCurrency(stats.weekSum)} icon={CalendarClock} />
          <KpiCard title="Ten miesiąc" value={formatCurrency(stats.monthSum)} icon={CreditCard} />
          <KpiCard
            title="Zaległości"
            value={formatCurrency(stats.overdueSum)}
            icon={AlertTriangle}
            trend="down"
            trendValue={stats.overdueCount > 0 ? `${stats.overdueCount} wizyt zaległych` : 'Brak zaległości'}
          />
        </div>

        <Card className="border-border/50">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-primary" />
              Filtry rozliczeń
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchBar
              placeholder="Szukaj klienta lub usługi..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Zakres zaległości</span>
                <span className="font-medium">
                  {formatCurrency(outstandingRange[0])} – {formatCurrency(outstandingRange[1])}
                </span>
              </div>
              <Slider
                value={outstandingRange}
                min={0}
                max={Math.max(0, Math.ceil(rows.reduce((max, row) => Math.max(max, row.payment.remaining), 0)))}
                step={10}
                onValueChange={(value) => setOutstandingRange([value[0], value[1]])}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Klient</span>
                <select
                  value={clientFilter}
                  onChange={(event) => setClientFilter(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Wszyscy klienci</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Status wizyty</span>
                <select
                  value={appointmentFilter}
                  onChange={(event) => setAppointmentFilter(event.target.value as AppointmentStatus | 'all')}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {appointmentFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Status płatności</span>
                <select
                  value={paymentFilter}
                  onChange={(event) => setPaymentFilter(event.target.value as 'all' | PaymentStatus | 'overdue')}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {paymentFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Lista rozliczeń</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">Ładowanie rozliczeń...</div>
            ) : filteredRows.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">Brak wyników dla wybranych filtrów.</div>
            ) : (
              filteredRows.map(({ appointment, payment }) => {
                const clientName = `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim();
                const serviceLabel = appointment.services && appointment.services.length > 0
                  ? appointment.services.map((service) => service.name).filter(Boolean).join(', ')
                  : appointment.service?.name || 'Brak usługi';
                const overdueLabel = formatCurrency(payment.remaining);
                const statusLabel = payment.status === 'paid'
                  ? 'Opłacono'
                  : payment.status === 'partial'
                    ? 'Częściowo'
                    : payment.isOverdue
                      ? 'Zaległa'
                      : 'Nieopłacona';

                const draftValue = draftPaidAmounts[appointment.id] ?? payment.paidAmount.toString();
                const remainingLabel = formatCurrency(payment.remaining);
                const remainingClass = payment.remaining > 0
                  ? payment.isOverdue
                    ? 'text-rose-600'
                    : 'text-amber-600'
                  : 'text-emerald-600';

                return (
                  <div
                    key={appointment.id}
                    className="rounded-lg border border-border/50 bg-background/60 p-4 space-y-3"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {appointment.date.toLocaleDateString('pl-PL')} · {appointment.startTime}
                        </p>
                        <p className="font-medium">{clientName || 'Brak danych klienta'}</p>
                        <p className="text-sm text-muted-foreground">{serviceLabel}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Do zapłaty</p>
                        <p className={cn('text-2xl font-bold', remainingClass)}>{remainingLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          Łącznie {formatCurrency(payment.total)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Status płatności</span>
                          <span className={cn(
                            'font-medium',
                            payment.status === 'paid' && 'text-emerald-600',
                            payment.status === 'partial' && 'text-amber-600',
                            payment.status === 'unpaid' && payment.isOverdue && 'text-rose-600'
                          )}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all',
                              payment.status === 'paid' && 'bg-emerald-500',
                              payment.status === 'partial' && 'bg-amber-500',
                              payment.status === 'unpaid' && payment.isOverdue && 'bg-rose-500',
                              payment.status === 'unpaid' && !payment.isOverdue && 'bg-muted-foreground/40'
                            )}
                            style={{ width: `${payment.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Zaległość</p>
                        <p className={cn('font-medium', remainingClass)}>
                          {remainingLabel}
                        </p>
                        {payment.isOverdue && payment.overdueDays > 0 && (
                          <p className="text-xs text-muted-foreground">{payment.overdueDays} dni zaległości</p>
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Wpłacono</p>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={draftValue}
                          onChange={(event) => handlePaidAmountChange(appointment.id, event.target.value)}
                          onBlur={() => handleSavePaidAmount(appointment.id)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => handleSavePaidAmount(appointment.id)}
                          disabled={Number(draftValue) === payment.paidAmount}
                        >
                          Zapisz
                        </Button>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Wizyta</p>
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          appointment.status === 'completed' && 'bg-emerald-100 text-emerald-700',
                          appointment.status === 'in-progress' && 'bg-blue-100 text-blue-700',
                          appointment.status === 'scheduled' && 'bg-slate-100 text-slate-700',
                          appointment.status === 'cancelled' && 'bg-red-100 text-red-700',
                          appointment.status === 'no-show' && 'bg-amber-100 text-amber-700'
                        )}>
                          {appointmentFilters.find((filter) => filter.value === appointment.status)?.label || appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
