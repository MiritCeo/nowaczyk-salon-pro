import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Car, Wrench, MessageSquare, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { clientsAPI, servicesAPI, employeesAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  prefillData?: {
    clientId?: string;
    carId?: string;
  };
  initialData?: {
    clientId?: string;
    carId?: string;
    serviceIds?: string[];
    employeeId?: string;
    date?: string;
    time?: string;
    notes?: string;
    extraCost?: string;
  };
}

export function NewAppointmentModal({ open, onClose, onSave, prefillData, initialData }: NewAppointmentModalProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    carId: '',
    serviceIds: [] as string[],
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: '',
    extraCost: '',
  });
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const canSeePrices = user?.role === 'admin';
  const selectedServices = services.filter(service =>
    service.id != null && formData.serviceIds.includes(service.id.toString())
  );
  const totalDuration = selectedServices.reduce((sum, service) => sum + (Number(service.duration) || 0), 0);
  const servicesTotalPrice = selectedServices.reduce((sum, service) => sum + (Number(service.price) || 0), 0);
  const extraCostValue = formData.extraCost ? Number(formData.extraCost) : 0;
  const totalPrice = servicesTotalPrice + (isNaN(extraCostValue) ? 0 : extraCostValue);

  useEffect(() => {
    if (open) {
      fetchData();
      // Wypełnij formularz danymi z prefillData jeśli są dostępne
      if (prefillData) {
        setFormData(prev => ({
          ...prev,
          clientId: prefillData.clientId || prev.clientId,
          carId: prefillData.carId || prev.carId,
        }));
      }
      if (initialData) {
        setFormData(prev => ({
          ...prev,
          clientId: initialData.clientId || prev.clientId,
          carId: initialData.carId || prev.carId,
          serviceIds: initialData.serviceIds || prev.serviceIds,
          employeeId: initialData.employeeId ?? prev.employeeId,
          date: initialData.date || prev.date,
          time: initialData.time || prev.time,
          notes: initialData.notes ?? prev.notes,
          extraCost: initialData.extraCost ?? prev.extraCost,
        }));
      }
    } else {
      // Reset form when modal closes
      setFormData({
        clientId: '',
        carId: '',
        serviceIds: [],
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        notes: '',
        extraCost: '',
      });
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefillData, initialData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pobierz dane osobno, aby jeden błąd nie blokował całego modala
      try {
        const clientsRes = await clientsAPI.getAll();
        setClients(clientsRes.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching clients:', error);
        console.error('Error details:', error.response?.data);
        setClients([]);
        if (!error.response) {
          setError('Brak połączenia z serwerem');
        }
      }
      
      try {
        const servicesRes = await servicesAPI.getAll({ active_only: 'true' });
        setServices(servicesRes.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching services:', error);
        console.error('Error details:', error.response?.data);
        setServices([]);
        if (!error.response) {
          setError('Brak połączenia z serwerem');
        }
      }
      
      try {
        const employeesRes = await employeesAPI.getAll();
        setEmployees(employeesRes.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching employees:', error);
        console.error('Error details:', error.response?.data);
        setEmployees([]);
        // Employees są opcjonalne, więc nie ustawiamy błędu
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Wystąpił błąd podczas ładowania danych');
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id && c.id.toString() === formData.clientId);
  // Jeśli klient nie ma samochodów, ale został wybrany, pobierz szczegóły klienta
  useEffect(() => {
    if (formData.clientId && selectedClient && (!selectedClient.cars || selectedClient.cars.length === 0)) {
      // Pobierz szczegóły klienta z samochodami
      clientsAPI.getOne(formData.clientId)
        .then(res => {
          const clientData = res.data.data;
          setClients(prev => prev.map(c => 
            c.id.toString() === formData.clientId 
              ? { ...c, cars: clientData.cars || [] }
              : c
          ));
        })
        .catch(err => console.error('Error fetching client details:', err));
    }
    // Resetuj wybór pojazdu gdy zmienia się klient (tylko jeśli nie jest to prefill)
    if (formData.clientId && !prefillData?.carId && !initialData?.carId) {
      setFormData(prev => ({ ...prev, carId: '' }));
    }
  }, [formData.clientId, prefillData, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja wymaganych pól
    if (!formData.clientId || formData.clientId === 'no-clients' || formData.clientId === 'loading-state') {
      setError('Wybierz klienta');
      return;
    }
    
    if (!formData.carId) {
      setError('Wybierz pojazd');
      return;
    }
    
    if (!formData.serviceIds || formData.serviceIds.length === 0) {
      setError('Wybierz co najmniej jedną usługę');
      return;
    }
    
    // Przekształć "none" na pusty string dla employeeId
    const submitData = {
      ...formData,
      employeeId: formData.employeeId === 'none' || !formData.employeeId ? '' : formData.employeeId,
      extraCost: formData.extraCost ? formData.extraCost : '',
    };
    
    setError(null);
    onSave(submitData);
    onClose();
  };

  if (!open) return null;
  const isEditing = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            Nowa wizyta
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Klient *
            </Label>
            <Select 
              value={formData.clientId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value, carId: '' }))}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Wybierz klienta" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {loading ? (
                  <SelectItem value="loading-state" disabled>Ładowanie...</SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="no-clients" disabled>Brak klientów w bazie</SelectItem>
                ) : (
                  clients
                    .filter(client => client.id != null)
                    .map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Car Selection */}
          {selectedClient && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                Pojazd *
              </Label>
              {selectedClient.cars && Array.isArray(selectedClient.cars) && selectedClient.cars.length > 0 ? (
                <Select 
                  value={formData.carId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, carId: value }))}
                  required
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Wybierz pojazd" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {selectedClient.cars
                      .filter((car: any) => car.id != null)
                      .map((car: any) => (
                        <SelectItem key={car.id} value={car.id.toString()}>
                          {car.brand} {car.model} · {car.color}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                  Ten klient nie ma jeszcze dodanych pojazdów. Dodaj pojazd w szczegółach klienta.
                </div>
              )}
            </div>
          )}

          {/* Services Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              Usługi *
            </Label>
            <div className="space-y-2">
              {loading ? (
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                  Ładowanie usług...
                </div>
              ) : services.length === 0 ? (
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                  Brak usług w bazie
                </div>
              ) : (
                services
                  .filter(service => service.id != null)
                  .map((service) => {
                    const serviceId = service.id.toString();
                    const isSelected = formData.serviceIds.includes(serviceId);
                    return (
                      <label
                        key={serviceId}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-primary"
                          checked={isSelected}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              serviceIds: checked
                                ? [...prev.serviceIds, serviceId]
                                : prev.serviceIds.filter(id => id !== serviceId)
                            }));
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.duration} min {canSeePrices && service.price && `· ${service.price} zł`}
                          </p>
                          {service.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })
              )}
            </div>
            {formData.serviceIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Wybrane usługi: {formData.serviceIds.length}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Data *
              </Label>
              <Input 
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className="bg-input border-border focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Godzina *
              </Label>
              <Input 
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
                className="bg-input border-border focus:ring-primary"
              />
            </div>
          </div>

          {/* Employee */}
          <div className="space-y-2">
            <Label>Pracownik</Label>
            <Select 
              value={formData.employeeId || "none"} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value === "none" ? "" : value }))}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Przypisz pracownika (opcjonalnie)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">Brak przypisania</SelectItem>
                {loading ? (
                  <SelectItem value="loading-state" disabled>Ładowanie...</SelectItem>
                ) : (
                  employees
                    .filter(employee => employee.id != null)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          {canSeePrices && (
            <div className="space-y-2">
              <Label htmlFor="extraCost" className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                Dopłata (opcjonalnie)
              </Label>
              <Input
                id="extraCost"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={formData.extraCost}
                onChange={(e) => setFormData(prev => ({ ...prev, extraCost: e.target.value }))}
                placeholder="Np. 50"
                className="bg-input border-border focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Dodatkowy koszt np. za bardzo zabrudzone auto
              </p>
            </div>
          )}

          {/* Summary */}
          {selectedServices.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
              <p className="text-sm font-medium">Podsumowanie</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Czas</span>
                <span className="font-medium">{totalDuration} min</span>
              </div>
              {canSeePrices && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Suma usług</span>
                    <span className="font-medium">{servicesTotalPrice.toFixed(2)} zł</span>
                  </div>
                  {formData.extraCost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Dopłata</span>
                      <span className="font-medium">{extraCostValue.toFixed(2)} zł</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Razem</span>
                    <span className="font-semibold">{totalPrice.toFixed(2)} zł</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Notatki
            </Label>
            <Textarea 
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Zalecenia, szczególne wymagania..."
              className="bg-input border-border focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            <Button type="submit" className="flex-1 gradient-brand shadow-button">
              <Plus className="w-4 h-4 mr-2" />
              {isEditing ? 'Zapisz zmiany' : 'Dodaj wizytę'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
