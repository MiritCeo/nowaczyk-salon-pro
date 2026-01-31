import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Car, Calendar, Edit, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { clientsAPI, appointmentsAPI, carsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Client, Appointment } from '@/types';
import { NewCarModal } from '@/components/modals/NewCarModal';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { EditClientModal } from '@/components/modals/EditClientModal';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCar, setShowNewCar] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const clientRes = await clientsAPI.getOne(id!);
      const clientData = clientRes.data.data;
      const transformedClient: Client = {
        id: clientData.id.toString(),
        firstName: clientData.first_name,
        lastName: clientData.last_name,
        phone: clientData.phone,
        email: clientData.email || undefined,
        notes: clientData.notes || undefined,
        totalVisits: clientData.total_visits || 0,
        cars: (clientData.cars || []).map((car: any) => ({
          id: car.id.toString(),
          clientId: car.client_id.toString(),
          brand: car.brand,
          model: car.model,
          color: car.color,
          plateNumber: car.plate_number || undefined,
          notes: car.notes || undefined,
        })),
        createdAt: new Date(clientData.created_at),
      };
      
      setClient(transformedClient);

      // Pobierz wizyty osobno, aby błąd nie blokował widoku klienta
      try {
        const appointmentsRes = await appointmentsAPI.getAll({ client_id: id });
        const transformedAppointments = appointmentsRes.data.data.map((apt: any) => ({
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
          } : undefined,
        }));

        setAppointments(transformedAppointments);
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: 'Nie udało się pobrać wizyt klienta',
        });
      }
    } catch (error: any) {
      console.error('Error fetching client:', error);
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać danych klienta',
      });
    } finally {
      setLoading(false);
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
  
  if (!client) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Nie znaleziono klienta</p>
          <Button variant="outline" onClick={() => navigate('/clients')} className="mt-4">
            Wróć do listy
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleSaveCar = async (data: any) => {
    try {
      await carsAPI.create(data);
      toast({
        title: "Pojazd dodany",
        description: "Nowy pojazd został dodany do klienta.",
      });
      setShowNewCar(false);
      fetchClientData(); // Odśwież dane klienta
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się dodać pojazdu',
      });
    }
  };

  const handleBookAppointment = (carId: string) => {
    setSelectedCarId(carId);
    setShowNewAppointment(true);
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
      
      await appointmentsAPI.create(appointmentData);
      
      toast({
        title: "Wizyta zaplanowana",
        description: "Nowa wizyta została dodana do kalendarza.",
      });
      setShowNewAppointment(false);
      setSelectedCarId(null);
      fetchClientData(); // Odśwież dane klienta
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się dodać wizyty',
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    if (!confirm(`Czy na pewno chcesz usunąć klienta ${client.firstName} ${client.lastName}?`)) {
      return;
    }
    try {
      await clientsAPI.delete(client.id);
      toast({
        title: "Klient usunięty",
        description: `${client.firstName} ${client.lastName} został usunięty.`,
      });
      navigate('/clients');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się usunąć klienta',
      });
    }
  };

  const handleUpdateClient = async (data: any) => {
    if (!client) return;
    try {
      await clientsAPI.update(client.id, data);
      toast({
        title: "Dane klienta zaktualizowane",
        description: `${client.firstName} ${client.lastName} został zaktualizowany.`,
      });
      setShowEditClient(false);
      fetchClientData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się zaktualizować klienta',
      });
    }
  };

  // Grupuj wizyty po samochodach
  const carHistories = client.cars.map(car => ({
    car,
    history: appointments.filter(apt => apt.carId === car.id)
  }));

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/clients')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground page-title">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-muted-foreground">
              Klient od {format(client.createdAt, 'd MMMM yyyy', { locale: pl })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowEditClient(true)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDeleteClient}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dane kontaktowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <a href={`tel:${client.phone}`} className="font-medium text-foreground hover:text-primary transition-colors">
                    {client.phone}
                  </a>
                </div>
              </div>
              
              {client.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${client.email}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {client.email}
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Liczba wizyt</p>
                  <p className="font-medium text-foreground">{client.totalVisits}</p>
                </div>
              </div>
            </div>
            
            {client.notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Notatki</p>
                <p className="text-foreground">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cars and Service History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Pojazdy i historia usług</h2>
            <Button variant="outline" size="sm" onClick={() => setShowNewCar(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj pojazd
            </Button>
          </div>

          {carHistories.map(({ car, history }) => (
            <Card key={car.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Car className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {car.brand} {car.model}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {car.plateNumber && <span>{car.plateNumber}</span>}
                        {car.color && (
                          <>
                            <span>•</span>
                            <span>{car.color}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="gradient-brand shadow-button"
                    onClick={() => handleBookAppointment(car.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Umów wizytę
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Usługa</TableHead>
                        <TableHead className="hidden sm:table-cell">Cena</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-32"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((appointment) => {
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">
                                  {format(appointment.date, 'd MMM yyyy', { locale: pl })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.startTime}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-foreground">
                                {appointment.services && appointment.services.length > 0
                                  ? (appointment.services.length > 1
                                      ? `${appointment.services[0]?.name} +${appointment.services.length - 1}`
                                      : appointment.services[0]?.name)
                                  : (appointment.service?.name || 'Usługa')}
                              </p>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {appointment.price ? (
                                <span className="text-foreground">{appointment.price} zł</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={appointment.status} />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/appointments/${appointment.id}/protocol`)}
                              >
                                Otwórz protokół
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Brak historii usług dla tego pojazdu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <NewCarModal 
        open={showNewCar} 
        onClose={() => setShowNewCar(false)}
        onSave={handleSaveCar}
        clientId={id!}
      />
      <NewAppointmentModal 
        open={showNewAppointment} 
        onClose={() => {
          setShowNewAppointment(false);
          setSelectedCarId(null);
        }}
        onSave={handleSaveAppointment}
        prefillData={selectedCarId && client ? {
          clientId: client.id,
          carId: selectedCarId,
        } : undefined}
      />
      <EditClientModal
        open={showEditClient}
        onClose={() => setShowEditClient(false)}
        onSave={handleUpdateClient}
        client={client}
      />
    </AppLayout>
  );
}
