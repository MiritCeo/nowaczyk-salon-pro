import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Bell, 
  Settings,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dzisiaj' },
  { path: '/calendar', icon: Calendar, label: 'Kalendarz' },
  { path: '/clients', icon: Users, label: 'Klienci' },
  { path: '/notifications', icon: Bell, label: 'Powiadomienia' },
  { path: '/settings', icon: Settings, label: 'Więcej' },
  { path: '/payments', icon: CreditCard, label: 'Rozliczenia', adminOnly: true },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.filter((item) => !item.adminOnly || user?.role === 'admin').map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl transition-all',
                isActive && 'bg-primary/10'
              )}>
                <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
