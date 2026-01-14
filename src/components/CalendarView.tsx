import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Appointment } from '@/types';

type ViewType = 'day' | 'week' | 'month';

const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
const monthNames = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

interface CalendarViewProps {
  appointments: Appointment[];
  onNewAppointment?: () => void;
  onSelectAppointment?: (id: string) => void;
}

export function CalendarView({ appointments, onNewAppointment, onSelectAppointment }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getWeekDates = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const weekDates = getWeekDates();
  const today = new Date();

  const formatDateTitle = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    } else if (view === 'week') {
      const start = weekDates[0];
      const end = weekDates[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]}`;
      }
      return `${start.getDate()} ${monthNames[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${monthNames[end.getMonth()].slice(0, 3)}`;
    }
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('prev')}
              className="h-9 w-9"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('next')}
              className="h-9 w-9"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold capitalize">{formatDateTitle()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  view === v 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v === 'day' ? 'Dzień' : v === 'week' ? 'Tydzień' : 'Miesiąc'}
              </button>
            ))}
          </div>
          
          <Button onClick={onNewAppointment} className="gradient-brand shadow-button">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nowa wizyta</span>
          </Button>
        </div>
      </div>

      {/* Week View */}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-2 flex-1">
          {weekDates.map((date, index) => {
            const appointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <div key={index} className="flex flex-col">
                <div className={cn(
                  'text-center py-2 rounded-t-lg',
                  isToday ? 'bg-primary/10' : 'bg-card'
                )}>
                  <p className="text-xs text-muted-foreground">{weekDays[index]}</p>
                  <p className={cn(
                    'text-lg font-semibold',
                    isToday && 'text-primary'
                  )}>
                    {date.getDate()}
                  </p>
                </div>
                
                <div className={cn(
                  'flex-1 p-1 space-y-1 bg-card/50 rounded-b-lg min-h-[200px]',
                  isToday && 'border border-primary/20'
                )}>
                  {appointments.map((apt) => {
                    const client = apt.client || { firstName: '', lastName: '' };
                    const services = apt.services && apt.services.length > 0
                      ? apt.services
                      : apt.service
                        ? [apt.service]
                        : [];
                    const primaryService = services[0] || { name: '' };
                    const serviceLabel = services.length > 1
                      ? `${primaryService.name} +${services.length - 1}`
                      : primaryService.name;
                    return (
                      <button
                        key={apt.id}
                        onClick={() => onSelectAppointment?.(apt.id)}
                        className={cn(
                          'w-full text-left p-1.5 rounded text-xs transition-all hover:ring-1 hover:ring-primary/50',
                          apt.status === 'completed' && 'bg-status-completed/10 border-l-2 border-status-completed',
                          apt.status === 'in-progress' && 'bg-status-in-progress/10 border-l-2 border-status-in-progress',
                          apt.status === 'scheduled' && 'bg-primary/10 border-l-2 border-primary',
                          apt.status === 'cancelled' && 'bg-status-cancelled/10 border-l-2 border-status-cancelled',
                          apt.status === 'no-show' && 'bg-status-no-show/10 border-l-2 border-status-no-show',
                        )}
                      >
                        <p className="font-semibold text-primary">{apt.startTime}</p>
                        <p className="truncate">{client.firstName} {client.lastName?.[0]}.</p>
                        <p className="text-muted-foreground truncate">{serviceLabel}</p>
                      </button>
                    );
                  })}
                  
                  {appointments.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <span className="text-xs">—</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="space-y-2">
          {getAppointmentsForDate(currentDate).map((apt) => {
            const client = apt.client || { firstName: '', lastName: '' };
            const services = apt.services && apt.services.length > 0
              ? apt.services
              : apt.service
                ? [apt.service]
                : [];
            const primaryService = services[0] || { name: '', duration: 0 };
            const totalDuration = services.reduce((sum, service) => sum + (service.duration || 0), 0);
            const serviceLabel = services.length > 1
              ? `${primaryService.name} +${services.length - 1}`
              : primaryService.name;
            return (
              <button
                key={apt.id}
                onClick={() => onSelectAppointment?.(apt.id)}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all text-left"
              >
                <div className="text-center min-w-[60px]">
                  <p className="text-xl font-bold text-primary">{apt.startTime}</p>
                  <p className="text-xs text-muted-foreground">{totalDuration} min</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{client.firstName} {client.lastName}</p>
                  <p className="text-sm text-muted-foreground truncate">{serviceLabel}</p>
                </div>
                <StatusBadge status={apt.status} />
              </button>
            );
          })}
          
          {getAppointmentsForDate(currentDate).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Brak wizyt na ten dzień</p>
              <Button onClick={onNewAppointment} variant="outline" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Dodaj wizytę
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center py-2 text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {(() => {
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const startPadding = (firstDay.getDay() + 6) % 7;
            const days = [];
            
            for (let i = 0; i < startPadding; i++) {
              days.push(<div key={`pad-${i}`} className="p-2" />);
            }
            
            for (let d = 1; d <= lastDay.getDate(); d++) {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
              const appointments = getAppointmentsForDate(date);
              const isToday = date.toDateString() === today.toDateString();
              
              days.push(
                <button
                  key={d}
                  onClick={() => {
                    setCurrentDate(date);
                    setView('day');
                  }}
                  className={cn(
                    'p-2 rounded-lg text-center transition-all hover:bg-secondary min-h-[60px]',
                    isToday && 'ring-1 ring-primary bg-primary/5'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    isToday && 'text-primary'
                  )}>
                    {d}
                  </span>
                  {appointments.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-1">
                      {appointments.slice(0, 3).map((apt, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            apt.status === 'scheduled' && 'bg-primary',
                            apt.status === 'in-progress' && 'bg-status-in-progress',
                            apt.status === 'completed' && 'bg-status-completed',
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            }
            
            return days;
          })()}
        </div>
      )}
    </div>
  );
}
