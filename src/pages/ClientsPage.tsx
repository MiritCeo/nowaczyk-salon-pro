import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Phone, Mail, Car, ChevronRight, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { NewClientModal } from '@/components/modals/NewClientModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { clientsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';

export default function ClientsPage() {
  const [showNewClient, setShowNewClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [searchQuery]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await clientsAPI.getAll(params);
      
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

  const filteredClients = useMemo(() => {
    // Wyszukiwanie już po stronie serwera, ale możemy też filtrować po stronie klienta
    return clients;
  }, [clients, searchQuery]);

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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Klienci</h1>
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
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleClientClick(client.id)}
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
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
    </AppLayout>
  );
}
