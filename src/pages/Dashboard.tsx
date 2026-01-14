import { useState } from 'react';
import { Calendar, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { QuickActions } from '@/components/QuickActions';
import { NewClientModal } from '@/components/modals/NewClientModal';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { AppointmentDetailModal } from '@/components/modals/AppointmentDetailModal';
import { getTodayAppointments, getTomorrowAppointments, getNewClientsCount, mockAppointments } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';

export default function Dashboard() {
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  
  const todayAppointments = getTodayAppointments();
  const tomorrowAppointments = getTomorrowAppointments();
  const newClientsCount = getNewClientsCount();

  const handleSaveClient = (data: any) => {
    toast({
      title: "Klient dodany",
      description: `${data.firstName} ${data.lastName} został dodany do bazy.`,
    });
  };

  const handleSaveAppointment = (data: any) => {
    toast({
      title: "Wizyta zaplanowana",
      description: "Nowa wizyta została dodana do kalendarza.",
    });
  };

  const handleNotify = () => {
    toast({
      title: "Powiadomienia",
      description: "Otwieranie centrum powiadomień...",
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
            value={todayAppointments.length}
            icon={Calendar}
            trendValue={`${inProgressCount} w trakcie, ${completedCount} zakończone`}
          />
          <KpiCard 
            title="Wizyty jutro" 
            value={tomorrowAppointments.length}
            icon={Clock}
          />
          <KpiCard 
            title="Nowi klienci" 
            value={newClientsCount}
            icon={Users}
            trendValue="ostatnie 30 dni"
            trend="up"
          />
          <KpiCard 
            title="Wskaźnik realizacji" 
            value="94%"
            icon={TrendingUp}
            trendValue="+2% vs poprzedni miesiąc"
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
      <AppointmentDetailModal
        appointment={selectedAppointment}
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
      />
    </AppLayout>
  );
}
