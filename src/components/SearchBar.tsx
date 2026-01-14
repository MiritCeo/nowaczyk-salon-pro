import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onFilter?: () => void;
  showFilter?: boolean;
  className?: string;
}

export function SearchBar({ 
  placeholder = 'Szukaj...', 
  value, 
  onChange, 
  onFilter, 
  showFilter = false,
  className 
}: SearchBarProps) {
  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10 bg-input border-border focus:ring-primary"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {showFilter && (
        <Button variant="outline" size="icon" onClick={onFilter}>
          <Filter className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
