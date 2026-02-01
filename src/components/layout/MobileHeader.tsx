import { Bell, Search } from 'lucide-react';
const logo = new URL('../../../22logocar.png', import.meta.url).href;
import { Button } from '@/components/ui/button';

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Garage 22" className="w-9 h-9 rounded-lg" />
          <div>
            <h1 className="font-bold text-sm">Garage 22</h1>
            <p className="text-[10px] text-primary font-medium uppercase tracking-wider">Demo Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
