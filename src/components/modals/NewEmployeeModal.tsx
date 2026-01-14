import { useEffect, useState } from 'react';
import { UserPlus, Mail, User, Shield, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function NewEmployeeModal({ open, onClose, onSave }: NewEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    notificationEmail: '',
    notificationPhone: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        notificationEmail: '',
        notificationPhone: '',
      });
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Wypełnij wymagane pola');
      return;
    }

    setError(null);
    onSave({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      notification_email: formData.notificationEmail || null,
      notification_phone: formData.notificationPhone || null,
      is_active: 1,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            Nowy pracownik
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Imię i nazwisko *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Jan Kowalski"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email (login) *
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="jan@nowaczyk.pl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Hasło *
            </Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Minimum 8 znaków"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rola</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz rolę" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="employee">Pracownik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email do powiadomień
            </Label>
            <Input
              type="email"
              value={formData.notificationEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, notificationEmail: e.target.value }))}
              placeholder="powiadomienia@nowaczyk.pl"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Telefon do powiadomień
            </Label>
            <Input
              value={formData.notificationPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, notificationPhone: e.target.value }))}
              placeholder="+48 600 000 000"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            <Button type="submit" className="flex-1 gradient-brand shadow-button">
              Dodaj pracownika
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
