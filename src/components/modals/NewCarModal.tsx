import { useState } from 'react';
import { Car, Tag, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NewCarModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  clientId: string;
}

export function NewCarModal({ open, onClose, onSave, clientId }: NewCarModalProps) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    color: '',
    plateNumber: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      client_id: parseInt(clientId),
      brand: formData.brand,
      model: formData.model,
      color: formData.color,
      plate_number: formData.plateNumber || null,
      notes: formData.notes || null,
    });
    onClose();
    setFormData({
      brand: '',
      model: '',
      color: '',
      plateNumber: '',
      notes: '',
    });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Car className="w-5 h-5 text-primary" />
            </div>
            Nowy pojazd
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              Marka *
            </Label>
            <Input 
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              required
              className="bg-input border-border focus:ring-primary"
              placeholder="np. Toyota"
            />
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model" className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              Model *
            </Label>
            <Input 
              id="model"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              required
              className="bg-input border-border focus:ring-primary"
              placeholder="np. Corolla"
            />
          </div>

          {/* Color & Plate Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color" className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Kolor *
              </Label>
              <Input 
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                required
                className="bg-input border-border focus:ring-primary"
                placeholder="np. Czerwony"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plateNumber">
                Numer rejestracyjny
              </Label>
              <Input 
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                className="bg-input border-border focus:ring-primary"
                placeholder="Opcjonalnie"
              />
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
              placeholder="Dodatkowe informacje o pojeździe..."
              className="bg-input border-border focus:ring-primary resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            <Button type="submit" className="flex-1 gradient-brand shadow-button">
              Dodaj pojazd
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
