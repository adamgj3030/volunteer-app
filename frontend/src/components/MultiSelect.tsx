import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

export interface MultiSelectOption {
  value: string | number;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  values: (string | number)[];
  onChange: (vals: (string | number)[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({ options, values, onChange, placeholder = 'Select…', disabled }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(() => new Set(values.map(String)), [values]);

  const toggle = (val: string | number) => {
    const sv = String(val);
    const next = new Set(selected);
    if (next.has(sv)) next.delete(sv); else next.add(sv);
    onChange(Array.from(next.values()));
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const labels = options.filter(o => selected.has(String(o.value))).map(o => o.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} disabled={disabled}
          className="w-full justify-between">
          {labels.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <span className="flex flex-wrap gap-1 max-w-[calc(100%-1.5rem)]">
              {labels.map(l => (
                <Badge key={l} variant="secondary">{l}</Badge>
              ))}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup className="max-h-56 overflow-y-auto">
            {options.map(o => {
              const isSel = selected.has(String(o.value));
              return (
                <CommandItem key={o.value} value={String(o.value)} onSelect={() => toggle(o.value)}>
                  <Check className={cn('mr-2 h-4 w-4', isSel ? 'opacity-100' : 'opacity-0')} />
                  {o.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}