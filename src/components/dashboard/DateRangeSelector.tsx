import { useState } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export interface DateRangeValue {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  dateRange: DateRangeValue;
  onDateRangeChange: (range: DateRangeValue) => void;
}

type PresetOption = 'custom' | 'today' | 'last7days' | 'last30days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth';

export function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps) {
  const [preset, setPreset] = useState<PresetOption>('last7days');
  const [isOpen, setIsOpen] = useState(false);

  const formatDateDisplay = () => {
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  const handlePresetChange = (value: PresetOption) => {
    setPreset(value);
    const today = new Date();
    
    switch (value) {
      case 'today':
        onDateRangeChange({ from: today, to: today });
        break;
      case 'last7days':
        onDateRangeChange({ from: subDays(today, 6), to: today });
        break;
      case 'last30days':
        onDateRangeChange({ from: subDays(today, 29), to: today });
        break;
      case 'thisWeek':
        onDateRangeChange({ 
          from: startOfWeek(today, { weekStartsOn: 1 }), 
          to: endOfWeek(today, { weekStartsOn: 1 }) 
        });
        break;
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
        onDateRangeChange({ 
          from: lastWeekStart, 
          to: endOfWeek(lastWeekStart, { weekStartsOn: 1 }) 
        });
        break;
      case 'thisMonth':
        onDateRangeChange({ 
          from: startOfMonth(today), 
          to: endOfMonth(today) 
        });
        break;
      case 'lastMonth':
        const lastMonthDate = subDays(startOfMonth(today), 1);
        onDateRangeChange({ 
          from: startOfMonth(lastMonthDate), 
          to: endOfMonth(lastMonthDate) 
        });
        break;
      case 'custom':
        // Keep current range
        break;
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setPreset('custom');
      onDateRangeChange({ from: range.from, to: range.to });
    } else if (range?.from) {
      // User selected only the start date, wait for end date
      setPreset('custom');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={(v) => handlePresetChange(v as PresetOption)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="last7days">Últimos 7 dias</SelectItem>
          <SelectItem value="last30days">Últimos 30 dias</SelectItem>
          <SelectItem value="thisWeek">Esta semana</SelectItem>
          <SelectItem value="lastWeek">Semana passada</SelectItem>
          <SelectItem value="thisMonth">Este mês</SelectItem>
          <SelectItem value="lastMonth">Mês passado</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="font-medium">Período: </span>
            <span className="ml-1">{formatDateDisplay()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleCalendarSelect}
            disabled={(date) => date > new Date()}
            initialFocus
            locale={ptBR}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Helper function to get date string for database queries
export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
