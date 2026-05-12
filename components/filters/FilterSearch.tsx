'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function FilterSearch({
  value,
  onChange,
  placeholder = 'Search transactions…',
  className,
  id = 'filter-search',
}: FilterSearchProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[12rem] md:max-w-sm',
        className
      )}
    >
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        Search
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 pl-8"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
