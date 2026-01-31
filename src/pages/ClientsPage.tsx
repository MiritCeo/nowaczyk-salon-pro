import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Phone, Mail, Car, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { NewClientModal } from '@/components/modals/NewClientModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { clientsAPI, appointmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Appointment, AppointmentStatus, Client } from '@/types';
import { getPaymentInfo } from '@/lib/payments';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientsPage() {
  const [showNewClient, setShowNewClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [outstandingRange, setOutstandingRange] = useState<[number, number]>([0, 0]);
  const [sortMode, setSortMode] = useState<'default' | 'outstanding_desc' | 'outstanding_asc'>('default');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canSeePayments = user?.role === 'admin';

  useEffect(() => {
    fetchClients();
  }, [searchQuery, canSeePayments]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = searchQuery ? { search: searchQuery } : {};
      const requests = [clientsAPI.getAll(params)];
      if (canSeePayments) {
        requests.push(appointmentsAPI.getAll());
      }
      const [response, appointmentsRes] = await Promise.all(requests);
      
      // Przekształć dane z API na format Client
      const transformed = response.data.data.map((client: any) => ({
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
      
      setClients(transformed);
      if (canSeePayments && appointmentsRes) {
        const mappedAppointments = (appointmentsRes.data.data || []).map((apt: any): Appointment => ({
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
        }));
        setAppointments(mappedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać klientów',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(value);

  const clientOutstandingMap = useMemo(() => {
    if (!canSeePayments) {
      return {};
    }
    const map: Record<string, number> = {};
    appointments.forEach((appointment) => {
      const payment = getPaymentInfo(appointment);
      if (payment.remaining > 0) {
        map[appointment.clientId] = (map[appointment.clientId] || 0) + payment.remaining;
      }
    });
    return map;
  }, [appointments, canSeePayments]);

  const filteredClients = useMemo(() => {
    const base = clients.filter((client) => {
      if (!canSeePayments) return true;
      const outstanding = clientOutstandingMap[client.id] || 0;
      return outstanding >= outstandingRange[0] && outstanding <= outstandingRange[1];
    });

    if (!canSeePayments || sortMode === 'default') {
      return base;
    }

    return [...base].sort((a, b) => {
      const aOutstanding = clientOutstandingMap[a.id] || 0;
      const bOutstanding = clientOutstandingMap[b.id] || 0;
      return sortMode === 'outstanding_desc'
        ? bOutstanding - aOutstanding
        : aOutstanding - bOutstanding;
    });
  }, [clients, clientOutstandingMap, outstandingRange, sortMode, canSeePayments]);

  useEffect(() => {
    if (!canSeePayments) {
      setOutstandingRange([0, 0]);
      return;
    }
    const maxOutstanding = Object.values(clientOutstandingMap).reduce((max, value) => Math.max(max, value), 0);
    setOutstandingRange(([min, max]) => {
      if (max === 0 && min === 0) {
        return [0, Math.ceil(maxOutstanding)];
      }
      return [Math.min(min, maxOutstanding), Math.max(max, maxOutstanding)];
    });
  }, [clientOutstandingMap, canSeePayments]);

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
      fetchClients(); // Odśwież listę
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się dodać klienta',
      });
    }
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Czy na pewno chcesz usunąć klienta ${client.firstName} ${client.lastName}?`)) {
      return;
    }
    try {
      await clientsAPI.delete(client.id);
      toast({
        title: "Klient usunięty",
        description: `${client.firstName} ${client.lastName} został usunięty.`,
      });
      fetchClients();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się usunąć klienta',
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground page-title">Klienci</h1>
            <p className="text-muted-foreground">
              {clients.length} {clients.length === 1 ? 'klient' : 'klientów'} w bazie
            </p>
          </div>
          
          <Button onClick={() => setShowNewClient(true)} className="gradient-brand shadow-button">
            <Plus className="w-4 h-4 mr-2" />
            Nowy klient
          </Button>
        </div>

        {/* Search */}
        <SearchBar 
          placeholder="Szukaj klienta, telefon, auto..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {canSeePayments && (
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Sortowanie</span>
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="default">Domyślnie</option>
                    <option value="outstanding_desc">Największe zaległości</option>
                    <option value="outstanding_asc">Najmniejsze zaległości</option>
                  </select>
                </label>
                <div className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Zakres zaległości</span>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatCurrency(outstandingRange[0])} – {formatCurrency(outstandingRange[1])}
                    </span>
                  </div>
                  <Slider
                    value={outstandingRange}
                    min={0}
                    max={Math.max(0, Math.ceil(Object.values(clientOutstandingMap).reduce((max, value) => Math.max(max, value), 0)))}
                    step={10}
                    onValueChange={(value) => setOutstandingRange([value[0], value[1]])}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Ładowanie klientów...</p>
            </div>
          </div>
        ) : filteredClients.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klient</TableHead>
                    <TableHead className="hidden md:table-cell">Telefon</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Pojazdy</TableHead>
                    <TableHead className="hidden md:table-cell">Wizyty</TableHead>
                    {canSeePayments && (
                      <TableHead className="hidden lg:table-cell">Zaległości</TableHead>
                    )}
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {client.firstName[0]}{client.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground md:hidden flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </p>
                            {canSeePayments && clientOutstandingMap[client.id] > 0 && (
                              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 md:hidden">
                                <AlertTriangle className="w-3 h-3" />
                                Zaległość {formatCurrency(clientOutstandingMap[client.id])}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {client.email ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {client.email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{client.cars.length}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-foreground">{client.totalVisits}</span>
                      </TableCell>
                      {canSeePayments && (
                        <TableCell className="hidden lg:table-cell">
                          <span className={cn(
                            'text-sm font-medium',
                            clientOutstandingMap[client.id] > 0 ? 'text-rose-600' : 'text-muted-foreground'
                          )}>
                            {clientOutstandingMap[client.id] > 0 ? formatCurrency(clientOutstandingMap[client.id]) : '—'}
                          </span>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-3"
                            onClick={() => handleClientClick(client.id)}
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Szczegóły
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-10 px-3"
                            onClick={() => setClientToDelete(client)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Usuń klienta
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <EmptyState 
            icon={Users}
            title={searchQuery ? "Brak wyników" : "Brak klientów"}
            description={searchQuery 
              ? "Spróbuj zmienić kryteria wyszukiwania" 
              : "Dodaj pierwszego klienta do swojej bazy"
            }
            action={!searchQuery ? {
              label: "Dodaj klienta",
              onClick: () => setShowNewClient(true)
            } : undefined}
          />
        )}
      </div>

      <NewClientModal 
        open={showNewClient} 
        onClose={() => setShowNewClient(false)}
        onSave={handleSaveClient}
      />
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń klienta?</AlertDialogTitle>
            <AlertDialogDescription>
              {clientToDelete
                ? `Czy na pewno chcesz usunąć klienta ${clientToDelete.firstName} ${clientToDelete.lastName}?`
                : 'Czy na pewno chcesz usunąć tego klienta?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (clientToDelete) {
                  handleDeleteClient(clientToDelete);
                }
                setClientToDelete(null);
              }}
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
