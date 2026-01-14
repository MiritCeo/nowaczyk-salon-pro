import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalendarView } from '@/components/CalendarView';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { AppointmentDetailModal } from '@/components/modals/AppointmentDetailModal';
import { mockAppointments } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';

export default function CalendarPage() {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const handleSaveAppointment = (data: any) => {
    toast({
      title: "Wizyta zaplanowana",
      description: "Nowa wizyta została dodana do kalendarza.",
    });
  };

  const handleSelectAppointment = (id: string) => {
    const appointment = mockAppointments.find(a => a.id === id);
    if (appointment) {
      setSelectedAppointment(appointment);
    }
  };

  const handleStatusChange = (id: string, status: any) => {
    toast({
      title: "Status zmieniony",
      description: `Status wizyty został zmieniony na: ${status}`,
    });
    setSelectedAppointment(null);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 h-full animate-fade-in">
        <CalendarView 
          onNewAppointment={() => setShowNewAppointment(true)}
          onSelectAppointment={handleSelectAppointment}
        />
      </div>

      <NewAppointmentModal 
        open={showNewAppointment} 
        onClose={() => setShowNewAppointment(false)}
        onSave={handleSaveAppointment}
      />
      <AppointmentDetailModal
        appointment={selectedAppointment}
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
      />
    </AppLayout>
  );
}
