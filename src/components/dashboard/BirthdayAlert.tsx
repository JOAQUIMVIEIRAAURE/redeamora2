import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Cake, PartyPopper, Bell } from 'lucide-react';
import { useUpcomingBirthdays, BirthdayMember } from '@/hooks/useBirthdays';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BirthdayAlertProps {
  celulaId?: string;
  compact?: boolean;
}

export function BirthdayAlert({ celulaId, compact = false }: BirthdayAlertProps) {
  const { data: birthdays, isLoading } = useUpcomingBirthdays(celulaId);
  
  if (isLoading || !birthdays || birthdays.length === 0) {
    return null;
  }
  
  const todayBirthdays = birthdays.filter(b => b.is_today);
  const tomorrowBirthdays = birthdays.filter(b => b.is_tomorrow);
  
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
          <Cake className="h-5 w-5" />
          <span className="font-semibold">
            {birthdays.length} aniversário{birthdays.length > 1 ? 's' : ''} próximo{birthdays.length > 1 ? 's' : ''}!
          </span>
        </div>
        <div className="space-y-1">
          {birthdays.slice(0, 3).map((b) => (
            <div key={b.id} className="flex items-center gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarImage src={b.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{b.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{b.name}</span>
              <Badge variant={b.is_today ? 'default' : 'secondary'} className="text-xs">
                {b.is_today ? 'Hoje!' : 'Amanhã'}
              </Badge>
            </div>
          ))}
          {birthdays.length > 3 && (
            <p className="text-xs text-muted-foreground">
              e mais {birthdays.length - 3}...
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
          <PartyPopper className="h-5 w-5" />
          Aniversários
          <Bell className="h-4 w-4 ml-auto animate-bounce" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayBirthdays.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-1">
              <Cake className="h-4 w-4" />
              Hoje! 🎉
            </h4>
            <div className="space-y-2">
              {todayBirthdays.map((birthday) => (
                <BirthdayCard key={birthday.id} birthday={birthday} highlight />
              ))}
            </div>
          </div>
        )}
        
        {tomorrowBirthdays.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Amanhã
            </h4>
            <div className="space-y-2">
              {tomorrowBirthdays.map((birthday) => (
                <BirthdayCard key={birthday.id} birthday={birthday} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BirthdayCard({ birthday, highlight = false }: { birthday: BirthdayMember; highlight?: boolean }) {
  const birthDate = parseISO(birthday.birth_date);
  const age = new Date().getFullYear() - birthDate.getFullYear();
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${
      highlight 
        ? 'bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800' 
        : 'bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
    }`}>
      <Avatar className="h-10 w-10 ring-2 ring-pink-300 dark:ring-pink-700">
        <AvatarImage src={birthday.avatar_url || undefined} />
        <AvatarFallback className="bg-pink-200 text-pink-700">
          {birthday.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{birthday.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {birthday.celula_name}
          </Badge>
          <span>•</span>
          <span>{format(birthDate, "dd 'de' MMMM", { locale: ptBR })}</span>
          {age > 0 && (
            <>
              <span>•</span>
              <span className="font-medium">{age} anos</span>
            </>
          )}
        </div>
      </div>
      {highlight && (
        <span className="text-2xl">🎂</span>
      )}
    </div>
  );
}
