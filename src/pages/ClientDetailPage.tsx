import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Car, Calendar, Edit, Plus } from 'lucide-react';
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
import { mockClients, getClientCarHistory, getServiceById } from '@/data/mockData';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const client = mockClients.find(c => c.id === id);
  
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

  const carHistories = client.cars.map(car => ({
    car,
    history: getClientCarHistory(client.id, car.id)
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-muted-foreground">
              Klient od {format(client.createdAt, 'd MMMM yyyy', { locale: pl })}
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
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
            <Button variant="outline" size="sm">
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
                  <Button size="sm" className="gradient-brand shadow-button">
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((appointment) => {
                        const service = getServiceById(appointment.serviceId);
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
                              <p className="font-medium text-foreground">{service?.name || 'Usługa'}</p>
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
    </AppLayout>
  );
}
