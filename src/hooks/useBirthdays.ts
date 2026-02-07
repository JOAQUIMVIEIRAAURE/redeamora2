import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { addDays, format, isEqual, parseISO } from 'date-fns';

export interface BirthdayMember {
  id: string;
  name: string;
  avatar_url: string | null;
  birth_date: string;
  celula_name: string;
  celula_id: string;
  is_today: boolean;
  is_tomorrow: boolean;
}

export function useUpcomingBirthdays(celulaId?: string) {
  return useQuery({
    queryKey: ['birthdays', celulaId],
    queryFn: async () => {
      // Get all members with birth dates
      let query = supabase
        .from('members')
        .select(`
          id,
          celula_id,
          profile:profiles!members_profile_id_fkey(
            id,
            name,
            avatar_url,
            birth_date
          ),
          celula:celulas!members_celula_id_fkey(
            id,
            name
          )
        `)
        .eq('is_active', true);
      
      if (celulaId) {
        query = query.eq('celula_id', celulaId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const today = new Date();
      const tomorrow = addDays(today, 1);
      
      const todayMonthDay = format(today, 'MM-dd');
      const tomorrowMonthDay = format(tomorrow, 'MM-dd');
      
      const birthdays: BirthdayMember[] = [];
      
      for (const member of data || []) {
        const profile = member.profile as any;
        if (!profile?.birth_date) continue;
        
        const birthDate = parseISO(profile.birth_date);
        const birthMonthDay = format(birthDate, 'MM-dd');
        
        const isToday = birthMonthDay === todayMonthDay;
        const isTomorrow = birthMonthDay === tomorrowMonthDay;
        
        if (isToday || isTomorrow) {
          birthdays.push({
            id: member.id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            birth_date: profile.birth_date,
            celula_name: (member.celula as any)?.name || '',
            celula_id: member.celula_id,
            is_today: isToday,
            is_tomorrow: isTomorrow,
          });
        }
      }
      
      // Sort: today first, then tomorrow
      return birthdays.sort((a, b) => {
        if (a.is_today && !b.is_today) return -1;
        if (!a.is_today && b.is_today) return 1;
        return a.name.localeCompare(b.name);
      });
    },
  });
}
