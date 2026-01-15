import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ClipboardList, 
  Bell, 
  Settings,
  CreditCard,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.jpg';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dzisiaj' },
  { path: '/calendar', icon: Calendar, label: 'Kalendarz' },
  { path: '/clients', icon: Users, label: 'Klienci' },
  { path: '/appointments', icon: ClipboardList, label: 'Wizyty' },
  { path: '/notifications', icon: Bell, label: 'Powiadomienia' },
  { path: '/settings', icon: Settings, label: 'Ustawienia' },
  { path: '/payments', icon: CreditCard, label: 'Rozliczenia', adminOnly: true },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[hsl(220,18%,10%)] text-[hsl(220,10%,90%)]">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-[hsl(220,12%,18%)]">
        <img src={logo} alt="Nowaczyk Auto Kosmetyka" className="w-10 h-10 rounded-lg" />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm truncate text-white">Nowaczyk</h1>
          <p className="text-[10px] text-primary font-medium uppercase tracking-wider">Auto Kosmetyka</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.filter((item) => !item.adminOnly || user?.role === 'admin').map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-button' 
                  : 'text-[hsl(220,10%,70%)] hover:bg-[hsl(220,12%,16%)] hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(220,12%,18%)] space-y-3">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            {user?.name.split(' ').map(n => n[0]).join('') || 'MN'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">{user?.name || 'Michał Nowaczyk'}</p>
            <p className="text-xs text-[hsl(220,10%,60%)]">{user?.role === 'admin' ? 'Administrator' : 'Pracownik'}</p>
          </div>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="w-full justify-start text-[hsl(220,10%,70%)] hover:bg-[hsl(220,12%,16%)] hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Wyloguj się
        </Button>
      </div>
    </aside>
  );
}
