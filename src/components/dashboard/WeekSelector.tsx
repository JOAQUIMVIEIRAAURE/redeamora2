import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeekSelectorProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
}

export function WeekSelector({ selectedWeek, onWeekChange }: WeekSelectorProps) {
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = addWeeks(weekStart, 1);
  weekEnd.setDate(weekEnd.getDate() - 1);

  const formatWeekDisplay = () => {
    return `${format(weekStart, "dd/MM/yyyy", { locale: ptBR })} - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  const handlePreviousWeek = () => {
    onWeekChange(subWeeks(selectedWeek, 1));
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(selectedWeek, 1);
    if (nextWeek <= new Date()) {
      onWeekChange(nextWeek);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onWeekChange(startOfWeek(date, { weekStartsOn: 1 }));
    }
  };

  const isNextWeekDisabled = addWeeks(selectedWeek, 1) > new Date();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousWeek}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="font-medium">Semana: </span>
            <span className="ml-1">{formatWeekDisplay()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedWeek}
            onSelect={handleDateSelect}
            disabled={(date) => date > new Date()}
            initialFocus
            locale={ptBR}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextWeek}
        disabled={isNextWeekDisabled}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function getWeekStartString(date: Date): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return weekStart.toISOString().split('T')[0];
}
