import { useEffect, useState } from 'react';
import { Wrench, Clock, DollarSign, MessageSquare, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewServiceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
  initialData?: {
    name?: string;
    description?: string;
    duration?: number;
    price?: number | null;
    category?: string;
  };
}

const categories = [
  'Mycie',
  'Detailing',
  'Konserwacja',
  'Naprawa',
  'Inne'
];

export function NewServiceModal({ open, onClose, onSave, onDelete, initialData }: NewServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
  });

  const isEditing = !!initialData;

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: '',
      });
      return;
    }

    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        duration: initialData.duration?.toString() || '',
        price: initialData.price != null ? initialData.price.toString() : '',
        category: initialData.category || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: '',
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description || null,
      duration: parseInt(formData.duration),
      price: formData.price ? parseFloat(formData.price) : null,
      category: formData.category,
      is_active: true,
    });
    onClose();
    setFormData({
      name: '',
      description: '',
      duration: '',
      price: '',
      category: '',
    });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            {isEditing ? 'Edytuj usługę' : 'Nowa usługa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              Nazwa usługi *
            </Label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="bg-input border-border focus:ring-primary"
              placeholder="np. Mycie podstawowe"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Kategoria *
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Czas trwania (min) *
              </Label>
              <Input 
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                required
                className="bg-input border-border focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Cena (zł)
              </Label>
              <Input 
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="bg-input border-border focus:ring-primary"
                placeholder="Opcjonalnie"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Opis
            </Label>
            <Textarea 
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Szczegółowy opis usługi..."
              className="bg-input border-border focus:ring-primary resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                className="flex-1"
              >
                Usuń
              </Button>
            )}
            <Button type="submit" className="flex-1 gradient-brand shadow-button">
              {isEditing ? 'Zapisz zmiany' : 'Dodaj usługę'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
