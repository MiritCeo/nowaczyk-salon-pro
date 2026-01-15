import { useState, useEffect } from 'react';
import { Wrench, Users, Clock, ChevronRight, Store, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { servicesAPI, employeesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NewServiceModal } from '@/components/modals/NewServiceModal';
import { NewEmployeeModal } from '@/components/modals/NewEmployeeModal';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const [showNewService, setShowNewService] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const canSeePrices = user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, employeesRes] = await Promise.all([
        servicesAPI.getAll(),
        employeesAPI.getAll(),
      ]);
      setServices(servicesRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać danych',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (data: any) => {
    try {
      await servicesAPI.create(data);
      toast({
        title: "Usługa dodana",
        description: `${data.name} została dodana do bazy.`,
      });
      setShowNewService(false);
      fetchData(); // Odśwież listę
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się dodać usługi',
      });
    }
  };

  const handleUpdateService = async (data: any) => {
    if (!editingService) return;
    try {
      await servicesAPI.update(editingService.id.toString(), data);
      toast({
        title: "Usługa zaktualizowana",
        description: `${data.name} została zaktualizowana.`,
      });
      setEditingService(null);
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się zaktualizować usługi',
      });
    }
  };

  const handleDeleteService = async () => {
    if (!editingService) return;
    if (!confirm('Czy na pewno chcesz usunąć tę usługę?')) return;
    try {
      await servicesAPI.delete(editingService.id.toString());
      toast({
        title: "Usługa usunięta",
        description: `${editingService.name} została usunięta.`,
      });
      setEditingService(null);
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się usunąć usługi',
      });
    }
  };

  const handleSaveEmployee = async (data: any) => {
    try {
      await employeesAPI.create(data);
      toast({
        title: "Pracownik dodany",
        description: `${data.name} został dodany do bazy.`,
      });
      setShowNewEmployee(false);
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się dodać pracownika',
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Ustawienia</h1>
          <p className="text-muted-foreground">Zarządzaj swoim salonem</p>
        </div>

        {/* Services Section */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-primary" />
              Usługi
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowNewService(true)}
              className="text-sm text-primary hover:underline font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Dodaj usługę
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {loading ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                Ładowanie...
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Brak usług w bazie</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowNewService(true)}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj pierwszą usługę
                </Button>
              </div>
            ) : (
              services.map((service) => (
              <div
                key={service.id}
                role="button"
                tabIndex={0}
                onClick={() => setEditingService(service)}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all text-left cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{service.name}</p>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                      {service.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      {service.duration} min
                    </span>
                    {canSeePrices && service.price && (
                      <span className="text-primary font-medium">{service.price} zł</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Employees Section */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Pracownicy
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm text-primary hover:underline font-medium"
              onClick={() => setShowNewEmployee(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Dodaj pracownika
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Ładowanie...
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Brak pracowników w bazie</p>
              </div>
            ) : (
              employees.map((employee) => (
              <button
                key={employee.id}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  employee.role === 'admin' 
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary/80 text-secondary-foreground'
                )}>
                  {employee.role === 'admin' ? 'Administrator' : 'Pracownik'}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              ))
            )}
          </CardContent>
        </Card>

        <NewServiceModal 
          open={showNewService} 
          onClose={() => setShowNewService(false)}
          onSave={handleSaveService}
        />
        <NewServiceModal
          open={!!editingService}
          onClose={() => setEditingService(null)}
          onSave={handleUpdateService}
          onDelete={handleDeleteService}
          initialData={editingService ? {
            name: editingService.name,
            description: editingService.description,
            duration: editingService.duration,
            price: editingService.price,
            category: editingService.category,
          } : undefined}
        />

        <NewEmployeeModal
          open={showNewEmployee}
          onClose={() => setShowNewEmployee(false)}
          onSave={handleSaveEmployee}
        />

        {/* Working Hours */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="w-5 h-5 text-primary" />
              Godziny pracy salonu
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { day: 'Poniedziałek', hours: '08:00 - 18:00' },
              { day: 'Wtorek', hours: '08:00 - 18:00' },
              { day: 'Środa', hours: '08:00 - 18:00' },
              { day: 'Czwartek', hours: '08:00 - 18:00' },
              { day: 'Piątek', hours: '08:00 - 18:00' },
              { day: 'Sobota', hours: '09:00 - 14:00' },
              { day: 'Niedziela', hours: 'Zamknięte', closed: true },
            ].map((schedule) => (
              <div 
                key={schedule.day}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50"
              >
                <span className={schedule.closed ? 'text-muted-foreground' : ''}>
                  {schedule.day}
                </span>
                <span className={cn(
                  'font-medium',
                  schedule.closed && 'text-muted-foreground'
                )}>
                  {schedule.hours}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}