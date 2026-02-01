import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalendarView } from '@/components/CalendarView';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { AppointmentDetailModal } from '@/components/modals/AppointmentDetailModal';
import { appointmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';

export default function CalendarPage() {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefillData, setPrefillData] = useState<{ date?: string; time?: string } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll({});
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
      fetchAppointments(); // Odśwież kalendarz
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
      fetchAppointments(); // Odśwież kalendarz
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się zmienić statusu',
      });
    }
  };

  const handleDateClick = (date: Date) => {
    setPrefillData({
      date: date.toISOString().split('T')[0],
    });
    setShowNewAppointment(true);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 h-full animate-fade-in">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Ładowanie kalendarza...</p>
            </div>
          </div>
        ) : (
          <CalendarView 
            appointments={appointments}
            onNewAppointment={() => setShowNewAppointment(true)}
            onSelectAppointment={handleSelectAppointment}
            onDateClick={handleDateClick}
          />
        )}
      </div>

      <NewAppointmentModal 
        open={showNewAppointment} 
        onClose={() => {
          setShowNewAppointment(false);
          setPrefillData(null);
        }}
        onSave={handleSaveAppointment}
        prefillData={prefillData || undefined}
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
        onOpenProtocol={(appointment) => navigate(`/appointments/${appointment.id}/protocol`)}
      />
    </AppLayout>
  );
}
