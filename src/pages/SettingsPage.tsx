import { Wrench, Users, Clock, ChevronRight, Store } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockServices, mockEmployees } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Ustawienia</h1>
          <p className="text-muted-foreground">Zarządzaj swoim salonem</p>
        </div>

        {/* Services Section */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-primary" />
              Usługi
            </CardTitle>
            <button className="text-sm text-primary hover:underline font-medium">+ Dodaj usługę</button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {mockServices.map((service) => (
              <button
                key={service.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{service.name}</p>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                      {service.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      {service.duration} min
                    </span>
                    {service.price && (
                      <span className="text-primary font-medium">{service.price} zł</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Employees Section */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Pracownicy
            </CardTitle>
            <button className="text-sm text-primary hover:underline font-medium">+ Dodaj pracownika</button>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockEmployees.map((employee) => (
              <button
                key={employee.id}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  employee.role === 'admin' 
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary/80 text-secondary-foreground'
                )}>
                  {employee.role === 'admin' ? 'Administrator' : 'Pracownik'}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="w-5 h-5 text-primary" />
              Godziny pracy salonu
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { day: 'Poniedziałek', hours: '08:00 - 18:00' },
              { day: 'Wtorek', hours: '08:00 - 18:00' },
              { day: 'Środa', hours: '08:00 - 18:00' },
              { day: 'Czwartek', hours: '08:00 - 18:00' },
              { day: 'Piątek', hours: '08:00 - 18:00' },
              { day: 'Sobota', hours: '09:00 - 14:00' },
              { day: 'Niedziela', hours: 'Zamknięte', closed: true },
            ].map((schedule) => (
              <div 
                key={schedule.day}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50"
              >
                <span className={schedule.closed ? 'text-muted-foreground' : ''}>
                  {schedule.day}
                </span>
                <span className={cn(
                  'font-medium',
                  schedule.closed && 'text-muted-foreground'
                )}>
                  {schedule.hours}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}