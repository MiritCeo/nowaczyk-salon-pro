import { useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientCard } from '@/components/ClientCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { NewClientModal } from '@/components/modals/NewClientModal';
import { Button } from '@/components/ui/button';
import { mockClients } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
  const [showNewClient, setShowNewClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

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

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Klienci</h1>
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
          showFilter
        />

        {/* Client List */}
        {filteredClients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => (
              <ClientCard 
                key={client.id} 
                client={client}
                onClick={() => console.log('Open client', client.id)}
              />
            ))}
          </div>
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
