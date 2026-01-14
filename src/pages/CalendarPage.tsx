import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalendarView } from '@/components/CalendarView';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const { toast } = useToast();

  const handleSaveAppointment = (data: any) => {
    toast({
      title: "Wizyta zaplanowana",
      description: "Nowa wizyta została dodana do kalendarza.",
    });
  };

  const handleSelectAppointment = (id: string) => {
    console.log('Selected appointment:', id);
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
    </AppLayout>
  );
}
