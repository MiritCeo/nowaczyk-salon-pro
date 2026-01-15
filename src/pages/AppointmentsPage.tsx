import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppointmentCard } from '@/components/AppointmentCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { AppointmentDetailModal } from '@/components/modals/AppointmentDetailModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { appointmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus, Appointment } from '@/types';
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
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery) {
        // Wyszukiwanie po stronie serwera - na razie po stronie klienta
      }
      
      const response = await appointmentsAPI.getAll(params);
      const transformed = response.data.data.map((apt: any) => ({
        id: apt.id.toString(),
        clientId: apt.client_id.toString(),
        carId: apt.car_id.toString(),
        serviceId: apt.service_id ? apt.service_id.toString() : undefined,
        serviceIds: Array.isArray(apt.service_ids) ? apt.service_ids.map((id: any) => id.toString()) : undefined,
        employeeId: apt.employee_id ? apt.employee_id.toString() : undefined,
        date: new Date(apt.date),
        startTime: apt.start_time,
        status: apt.status as any,
        notes: apt.notes || undefined,
        price: apt.price ? parseFloat(apt.price) : undefined,
        extraCost: apt.extra_cost ? parseFloat(apt.extra_cost) : undefined,
        paidAmount: apt.paid_amount ? parseFloat(apt.paid_amount) : undefined,
        // Dodatkowe dane z API
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
      }));
      
      setAppointments(transformed);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać wizyt',
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateCompare = b.date.getTime() - a.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const filteredAppointments = useMemo(() => {
    return sortedAppointments.filter(apt => {
      // Search filter
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        apt.client?.firstName?.toLowerCase().includes(query) ||
        apt.client?.lastName?.toLowerCase().includes(query) ||
        apt.service?.name?.toLowerCase().includes(query) ||
        apt.services?.some(service => service?.name?.toLowerCase().includes(query)) ||
        apt.startTime.includes(query)
      );
    });
  }, [searchQuery, sortedAppointments]);

  const handleSaveAppointment = async (data: any) => {
    try {
      // Walidacja przed wysłaniem
      if (!data.clientId || !data.carId || !data.serviceIds || data.serviceIds.length === 0 || !data.date || !data.time) {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: 'Wypełnij wszystkie wymagane pola',
        });
        return;
      }
      
      const appointmentData = {
        client_id: parseInt(data.clientId),
        car_id: parseInt(data.carId),
        service_ids: data.serviceIds.map((id: string) => parseInt(id)),
        employee_id: data.employeeId && data.employeeId !== '' ? parseInt(data.employeeId) : null,
        date: data.date,
        start_time: data.time,
        notes: data.notes || null,
        extra_cost: data.extraCost ? parseFloat(data.extraCost) : null,
        status: 'scheduled',
      };
      
      console.log('Wysyłam dane wizyty:', appointmentData);
      
      await appointmentsAPI.create(appointmentData);
      
      toast({
        title: "Wizyta zaplanowana",
        description: "Nowa wizyta została dodana do kalendarza.",
      });
      setShowNewAppointment(false);
      fetchAppointments(); // Odśwież listę
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się dodać wizyty',
      });
    }
  };

  const handleUpdateAppointment = async (data: any) => {
    if (!editingAppointment) return;
    try {
      if (!data.clientId || !data.carId || !data.serviceIds || data.serviceIds.length === 0 || !data.date || !data.time) {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: 'Wypełnij wszystkie wymagane pola',
        });
        return;
      }

      const appointmentData = {
        client_id: parseInt(data.clientId),
        car_id: parseInt(data.carId),
        service_ids: data.serviceIds.map((id: string) => parseInt(id)),
        employee_id: data.employeeId && data.employeeId !== '' ? parseInt(data.employeeId) : null,
        date: data.date,
        start_time: data.time,
        notes: data.notes || null,
        extra_cost: data.extraCost ? parseFloat(data.extraCost) : null,
        status: editingAppointment.status,
      };

      await appointmentsAPI.update(editingAppointment.id, appointmentData);
      toast({
        title: "Wizyta zaktualizowana",
        description: "Zmiany zostały zapisane.",
      });
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się zaktualizować wizyty',
      });
    }
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!confirm('Czy na pewno chcesz usunąć tę wizytę?')) return;
    try {
      await appointmentsAPI.delete(appointment.id);
      toast({
        title: "Wizyta usunięta",
        description: "Wizyta została usunięta.",
      });
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się usunąć wizyty',
      });
    }
  };

  const handleSelectAppointment = async (id: string) => {
    try {
      const response = await appointmentsAPI.getOne(id);
      const apt = response.data.data;
      setSelectedAppointment({
        id: apt.id.toString(),
        clientId: apt.client_id.toString(),
        carId: apt.car_id.toString(),
        serviceId: apt.service_id ? apt.service_id.toString() : undefined,
        serviceIds: Array.isArray(apt.service_ids) ? apt.service_ids.map((id: any) => id.toString()) : undefined,
        employeeId: apt.employee_id ? apt.employee_id.toString() : undefined,
        date: new Date(apt.date),
        startTime: apt.start_time,
        status: apt.status as any,
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
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const handleStatusChange = async (id: string, status: any) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      toast({
        title: "Status zmieniony",
        description: `Status wizyty został zmieniony na: ${status}`,
      });
      setSelectedAppointment(null);
      fetchAppointments(); // Odśwież listę
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się zmienić statusu',
      });
    }
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
              {appointments.length} wizyt w systemie
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Ładowanie wizyt...</p>
            </div>
          </div>
        ) : groupedAppointments.length > 0 ? (
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
                      onClick={() => handleSelectAppointment(appointment.id)}
                      onOpenProtocol={(selected) => navigate(`/appointments/${selected.id}/protocol`)}
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
      <NewAppointmentModal
        open={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onSave={handleUpdateAppointment}
        initialData={editingAppointment ? {
          clientId: editingAppointment.clientId,
          carId: editingAppointment.carId,
          serviceIds: editingAppointment.serviceIds || (editingAppointment.serviceId ? [editingAppointment.serviceId] : []),
          employeeId: editingAppointment.employeeId,
          date: editingAppointment.date.toISOString().split('T')[0],
          time: editingAppointment.startTime,
          notes: editingAppointment.notes || '',
          extraCost: editingAppointment.extraCost != null ? editingAppointment.extraCost.toString() : '',
        } : undefined}
      />
      <AppointmentDetailModal
        appointment={selectedAppointment}
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
        onEdit={(appointment) => {
          setSelectedAppointment(null);
          setEditingAppointment(appointment);
        }}
        onDelete={handleDeleteAppointment}
        onOpenProtocol={(appointment) => {
          setSelectedAppointment(null);
          navigate(`/appointments/${appointment.id}/protocol`);
        }}
      />
    </AppLayout>
  );
}
