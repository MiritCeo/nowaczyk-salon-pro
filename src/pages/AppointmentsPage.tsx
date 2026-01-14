import { useState, useMemo } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppointmentCard } from '@/components/AppointmentCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { mockAppointments, getClientById, getServiceById } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusFilters: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'scheduled', label: 'Zaplanowane' },
  { value: 'in-progress', label: 'W trakcie' },
  { value: 'completed', label: 'Zakończone' },
  { value: 'cancelled', label: 'Anulowane' },
];

export default function AppointmentsPage() {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const { toast } = useToast();

  const sortedAppointments = [...mockAppointments].sort((a, b) => {
    const dateCompare = b.date.getTime() - a.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const filteredAppointments = useMemo(() => {
    return sortedAppointments.filter(apt => {
      // Status filter
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
      
      // Search filter
      if (!searchQuery) return true;
      
      const client = getClientById(apt.clientId);
      const service = getServiceById(apt.serviceId);
      const query = searchQuery.toLowerCase();
      
      return (
        client?.firstName.toLowerCase().includes(query) ||
        client?.lastName.toLowerCase().includes(query) ||
        service?.name.toLowerCase().includes(query) ||
        apt.time.includes(query)
      );
    });
  }, [searchQuery, statusFilter, sortedAppointments]);

  const handleSaveAppointment = (data: any) => {
    toast({
      title: "Wizyta zaplanowana",
      description: "Nowa wizyta została dodana do kalendarza.",
    });
  };

  // Group by date
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: typeof filteredAppointments } = {};
    
    filteredAppointments.forEach(apt => {
      const dateKey = apt.date.toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(apt);
    });
    
    return Object.entries(groups).map(([date, appointments]) => ({
      date: new Date(date),
      appointments
    }));
  }, [filteredAppointments]);

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Dzisiaj';
    if (date.toDateString() === tomorrow.toDateString()) return 'Jutro';
    
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Wizyty</h1>
            <p className="text-muted-foreground">
              {mockAppointments.length} wizyt w systemie
            </p>
          </div>
          
          <Button onClick={() => setShowNewAppointment(true)} className="gradient-brand shadow-button">
            <Plus className="w-4 h-4 mr-2" />
            Nowa wizyta
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <SearchBar 
            placeholder="Szukaj wizyty, klienta..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  statusFilter === filter.value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        {groupedAppointments.length > 0 ? (
          <div className="space-y-8">
            {groupedAppointments.map(({ date, appointments }) => (
              <div key={date.toISOString()}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                  {formatDateHeader(date)}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {appointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment}
                      onClick={() => console.log('Open appointment', appointment.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={ClipboardList}
            title={searchQuery || statusFilter !== 'all' ? "Brak wyników" : "Brak wizyt"}
            description={searchQuery || statusFilter !== 'all'
              ? "Spróbuj zmienić kryteria wyszukiwania" 
              : "Zaplanuj pierwszą wizytę w kalendarzu"
            }
            action={!searchQuery && statusFilter === 'all' ? {
              label: "Zaplanuj wizytę",
              onClick: () => setShowNewAppointment(true)
            } : undefined}
          />
        )}
      </div>

      <NewAppointmentModal 
        open={showNewAppointment} 
        onClose={() => setShowNewAppointment(false)}
        onSave={handleSaveAppointment}
      />
    </AppLayout>
  );
}
