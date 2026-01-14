import { useState } from 'react';
import { X, User, Phone, Mail, MessageSquare, Car, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NewClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function NewClientModal({ open, onClose, onSave }: NewClientModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: '',
    carBrand: '',
    carModel: '',
    carColor: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      notes: '',
      carBrand: '',
      carModel: '',
      carColor: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            Nowy klient
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Personal Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię *</Label>
                <Input 
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Jan"
                  required
                  className="bg-input border-border focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko *</Label>
                <Input 
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Kowalski"
                  required
                  className="bg-input border-border focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Telefon *
              </Label>
              <Input 
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+48 600 123 456"
                required
                className="bg-input border-border focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="jan.kowalski@email.pl"
                className="bg-input border-border focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Car Info */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Pojazd (opcjonalnie)
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="carBrand">Marka</Label>
                <Input 
                  id="carBrand"
                  value={formData.carBrand}
                  onChange={(e) => setFormData(prev => ({ ...prev, carBrand: e.target.value }))}
                  placeholder="BMW"
                  className="bg-input border-border focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carModel">Model</Label>
                <Input 
                  id="carModel"
                  value={formData.carModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, carModel: e.target.value }))}
                  placeholder="M3"
                  className="bg-input border-border focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carColor">Kolor</Label>
                <Input 
                  id="carColor"
                  value={formData.carColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, carColor: e.target.value }))}
                  placeholder="Czarny"
                  className="bg-input border-border focus:ring-primary"
                />
              </div>
            </div>
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
              placeholder="Dodatkowe informacje o kliencie..."
              className="bg-input border-border focus:ring-primary resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            <Button type="submit" className="flex-1 gradient-brand shadow-button">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj klienta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
