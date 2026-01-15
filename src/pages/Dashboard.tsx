import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { QuickActions } from '@/components/QuickActions';
import { NewClientModal } from '@/components/modals/NewClientModal';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { AppointmentDetailModal } from '@/components/modals/AppointmentDetailModal';
import { dashboardAPI, appointmentsAPI, clientsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';

export default function Dashboard() {
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [tomorrowAppointments, setTomorrowAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      const { data } = response.data;
      
      // Przekształć dane z API na format Appointment
      const transformAppointment = (apt: any): Appointment => ({
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
      });

      setTodayAppointments(data.today_appointments.map(transformAppointment));
      setTomorrowAppointments(data.tomorrow_appointments.map(transformAppointment));
      setStats(data.stats);
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać danych dashboard',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async (data: any) => {
    try {
      await clientsAPI.create({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email || null,
        notes: data.notes || null,
        car: data.carBrand ? {
          brand: data.carBrand,
          model: data.carModel,
          color: data.carColor,
          plate_number: null,
        } : undefined,
      });
      
      toast({
        title: "Klient dodany",
        description: `${data.firstName} ${data.lastName} został dodany do bazy.`,
      });
      setShowNewClient(false);
      fetchDashboardData(); // Odśwież dane
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się dodać klienta',
      });
    }
  };

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
      fetchDashboardData(); // Odśwież dane
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
      fetchDashboardData();
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
      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się usunąć wizyty',
      });
    }
  };

  const handleNotify = () => {
    toast({
      title: "Powiadomienia",
      description: "Otwieranie centrum powiadomień...",
    });
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
      fetchDashboardData(); // Odśwież dane
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się zmienić statusu',
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Ładowanie...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const inProgressCount = todayAppointments.filter(a => a.status === 'in-progress').length;
  const completedCount = todayAppointments.filter(a => a.status === 'completed').length;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Dzisiaj</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('pl-PL', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <QuickActions 
            onNewAppointment={() => setShowNewAppointment(true)}
            onNewClient={() => setShowNewClient(true)}
            onNotify={handleNotify}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Wizyty dziś" 
            value={stats?.today_total || 0}
            icon={Calendar}
            trendValue={`${stats?.today_in_progress || 0} w trakcie, ${stats?.today_completed || 0} zakończone`}
          />
          <KpiCard 
            title="Wizyty jutro" 
            value={stats?.tomorrow_total || 0}
            icon={Clock}
          />
          <KpiCard 
            title="Nowi klienci" 
            value={stats?.new_clients_30d || 0}
            icon={Users}
            trendValue="ostatnie 30 dni"
            trend="up"
          />
          <KpiCard 
            title="Wskaźnik realizacji" 
            value={stats?.today_total > 0 ? Math.round((stats.today_completed / stats.today_total) * 100) + '%' : '0%'}
            icon={TrendingUp}
            trendValue={stats?.today_completed > 0 ? `+${stats.today_completed} zakończone` : 'Brak danych'}
            trend="up"
          />
        </div>

        {/* Today's Schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Harmonogram dnia</h2>
            <a href="/calendar" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Zobacz kalendarz
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {todayAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  onClick={() => handleSelectAppointment(appointment.id)}
                  onOpenProtocol={(selected) => navigate(`/appointments/${selected.id}/protocol`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Brak wizyt na dziś</p>
            </div>
          )}
        </div>

        {/* Tomorrow Preview */}
        {tomorrowAppointments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Jutro</h2>
            <div className="space-y-2">
              {tomorrowAppointments.slice(0, 3).map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  compact
                  onClick={() => handleSelectAppointment(appointment.id)}
                  onOpenProtocol={(selected) => navigate(`/appointments/${selected.id}/protocol`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewClientModal 
        open={showNewClient} 
        onClose={() => setShowNewClient(false)}
        onSave={handleSaveClient}
      />
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
      />
    </AppLayout>
  );
}
