import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Phone, Mail, Car, ChevronRight } from 'lucide-react';
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
import { mockClients } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
  const [showNewClient, setShowNewClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredClients = useMemo(() => {
    if (!searchQuery) return mockClients;
    
    const query = searchQuery.toLowerCase();
    return mockClients.filter(client => 
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.cars.some(car => 
        car.brand.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.plateNumber?.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  const handleSaveClient = (data: any) => {
    toast({
      title: "Klient dodany",
      description: `${data.firstName} ${data.lastName} został dodany do bazy.`,
    });
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Klienci</h1>
            <p className="text-muted-foreground">
              {mockClients.length} {mockClients.length === 1 ? 'klient' : 'klientów'} w bazie
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
        {filteredClients.length > 0 ? (
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
                    <TableHead className="w-10"></TableHead>
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
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
