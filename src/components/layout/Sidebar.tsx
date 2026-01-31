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
const logo = new URL('../../../app-logo.png', import.meta.url).href;

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
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <img src={logo} alt="Car22" className="w-10 h-10 rounded-lg" />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm truncate text-sidebar-foreground">Car22</h1>
          <p className="text-[10px] text-primary font-medium uppercase tracking-wider">Demo Platform</p>
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
                  ? 'bg-primary/25 text-primary-foreground shadow-button' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            {user?.name.split(' ').map(n => n[0]).join('') || 'MN'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.name || 'Car22 Admin'}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.role === 'admin' ? 'Administrator' : 'Pracownik'}</p>
          </div>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Wyloguj się
        </Button>
      </div>
    </aside>
  );
}
