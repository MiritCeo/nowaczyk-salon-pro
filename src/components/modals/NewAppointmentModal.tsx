import { useState } from 'react';
import { Calendar, Clock, User, Car, Wrench, MessageSquare, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockClients, mockServices, mockEmployees } from '@/data/mockData';

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function NewAppointmentModal({ open, onClose, onSave }: NewAppointmentModalProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    carId: '',
    serviceId: '',
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: '',
  });

  const selectedClient = mockClients.find(c => c.id === formData.clientId);
  const selectedService = mockServices.find(s => s.id === formData.serviceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      clientId: '',
      carId: '',
      serviceId: '',
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      notes: '',
    });
  };

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
                {mockClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Car Selection */}
          {selectedClient && selectedClient.cars.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                Pojazd *
              </Label>
              <Select 
                value={formData.carId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, carId: value }))}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Wybierz pojazd" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {selectedClient.cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.brand} {car.model} · {car.color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Service Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              Usługa *
            </Label>
            <Select 
              value={formData.serviceId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Wybierz usługę" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {mockServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span>{service.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {service.duration} min {service.price && `· ${service.price} zł`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedService && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedService.description}
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
              value={formData.employeeId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Przypisz pracownika (opcjonalnie)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {mockEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              Dodaj wizytę
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
