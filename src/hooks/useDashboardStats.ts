import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalMembers: number;
  totalCelulas: number;
  attendanceRate: number;
  growth: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get total active members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      // Get total celulas
      const { count: totalCelulas } = await supabase
        .from('celulas')
        .select('*', { count: 'exact', head: true });
      
      // Calculate attendance rate from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentMeetings } = await supabase
        .from('meetings')
        .select('id')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      let attendanceRate = 0;
      if (recentMeetings && recentMeetings.length > 0) {
        const meetingIds = recentMeetings.map(m => m.id);
        
        const { count: totalAttendances } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .in('meeting_id', meetingIds);
        
        const { count: presentAttendances } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .in('meeting_id', meetingIds)
          .eq('present', true);
        
        if (totalAttendances && totalAttendances > 0) {
          attendanceRate = Math.round(((presentAttendances || 0) / totalAttendances) * 100);
        }
      }
      
      // Calculate growth (members added in last 30 days vs previous 30 days)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { count: recentMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('joined_at', thirtyDaysAgo.toISOString());
      
      const { count: previousMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('joined_at', sixtyDaysAgo.toISOString())
        .lt('joined_at', thirtyDaysAgo.toISOString());
      
      let growth = 0;
      if (previousMembers && previousMembers > 0) {
        growth = Math.round((((recentMembers || 0) - previousMembers) / previousMembers) * 100);
      } else if (recentMembers && recentMembers > 0) {
        growth = 100;
      }
      
      return {
        totalMembers: totalMembers || 0,
        totalCelulas: totalCelulas || 0,
        attendanceRate,
        growth,
      } as DashboardStats;
    },
  });
}

export function useAttendanceByCell() {
  return useQuery({
    queryKey: ['attendance-by-cell'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: celulas } = await supabase
        .from('celulas')
        .select('id, name');
      
      if (!celulas || celulas.length === 0) return [];
      
      const result = await Promise.all(celulas.map(async (celula) => {
        const { data: meetings } = await supabase
          .from('meetings')
          .select('id')
          .eq('celula_id', celula.id)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
        
        if (!meetings || meetings.length === 0) {
          return { name: celula.name, presenca: 0 };
        }
        
        const meetingIds = meetings.map(m => m.id);
        
        const { count: totalAttendances } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .in('meeting_id', meetingIds);
        
        const { count: presentAttendances } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .in('meeting_id', meetingIds)
          .eq('present', true);
        
        const rate = totalAttendances && totalAttendances > 0 
          ? Math.round(((presentAttendances || 0) / totalAttendances) * 100)
          : 0;
        
        return { name: celula.name, presenca: rate };
      }));
      
      return result;
    },
  });
}

export function useMemberGrowth() {
  return useQuery({
    queryKey: ['member-growth'],
    queryFn: async () => {
      const months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const { count } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .lt('joined_at', nextMonth.toISOString());
        
        months.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          membros: count || 0,
        });
      }
      
      return months;
    },
  });
}
