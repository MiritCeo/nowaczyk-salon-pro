import { Bell, Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockNotifications = [
  {
    id: '1',
    type: 'reminder',
    title: 'Przypomnienie wysłane',
    description: 'SMS do Jan Kowalski (wizyta jutro 09:00)',
    time: '2 min temu',
    read: false,
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Nowa wizyta',
    description: 'Anna Nowak zarezerwowała wizytę na 20.01.2026',
    time: '1 godz. temu',
    read: false,
  },
  {
    id: '3',
    type: 'completed',
    title: 'Wizyta zakończona',
    description: 'Korekta lakieru - BMW M3 (Jan Kowalski)',
    time: '3 godz. temu',
    read: true,
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Przypomnienie wysłane',
    description: 'Email do Piotr Wiśniewski (wizyta dziś 14:00)',
    time: '5 godz. temu',
    read: true,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'reminder': return Bell;
    case 'appointment': return Calendar;
    case 'completed': return Check;
    default: return AlertCircle;
  }
};

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Powiadomienia</h1>
            <p className="text-muted-foreground">
              {mockNotifications.filter(n => !n.read).length} nieprzeczytanych
            </p>
          </div>
          
          <Button variant="outline" size="sm">
            Oznacz jako przeczytane
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {mockNotifications.map((notification) => {
            const Icon = getIcon(notification.type);
            
            return (
              <button
                key={notification.id}
                className={cn(
                  'w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all',
                  notification.read 
                    ? 'bg-card/50 hover:bg-card' 
                    : 'bg-card hover:bg-secondary border-l-2 border-primary'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg shrink-0',
                  notification.type === 'completed' 
                    ? 'bg-status-completed/10 text-status-completed'
                    : 'bg-primary/10 text-primary'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      'font-medium',
                      !notification.read && 'text-foreground'
                    )}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {notification.description}
                  </p>
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Templates Section (Admin) */}
        <div className="pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Szablony powiadomień</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: 'Przypomnienie 24h', desc: 'Wysyłane dzień przed wizytą', active: true },
              { name: 'Przypomnienie 2h', desc: 'Wysyłane 2 godziny przed wizytą', active: true },
              { name: 'Zmiana terminu', desc: 'Informacja o przełożeniu wizyty', active: true },
              { name: 'Potwierdzenie', desc: 'Potwierdzenie rezerwacji', active: false },
            ].map((template) => (
              <div 
                key={template.name}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
              >
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.desc}</p>
                </div>
                <div className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  template.active 
                    ? 'bg-status-completed/10 text-status-completed'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {template.active ? 'Aktywny' : 'Nieaktywny'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
