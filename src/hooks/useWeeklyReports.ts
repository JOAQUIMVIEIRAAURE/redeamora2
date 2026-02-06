import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WeeklyReport {
  id: string;
  celula_id: string;
  week_start: string;
  members_present: number;
  leaders_in_training: number;
  discipleships: number;
  visitors: number;
  children: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  celula?: {
    id: string;
    name: string;
    coordenacao_id: string;
    coordenacao?: {
      id: string;
      name: string;
      rede_id: string;
      rede?: {
        id: string;
        name: string;
      };
    };
  };
}

export interface WeeklyReportInput {
  celula_id: string;
  week_start: string;
  members_present: number;
  leaders_in_training: number;
  discipleships: number;
  visitors: number;
  children: number;
  notes?: string;
}

// Get current week's Monday
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function useWeeklyReports(celulaId?: string) {
  return useQuery({
    queryKey: ['weekly-reports', celulaId],
    queryFn: async () => {
      let query = supabase
        .from('weekly_reports')
        .select(`
          *,
          celula:celulas(
            id,
            name,
            coordenacao_id,
            coordenacao:coordenacoes(
              id,
              name,
              rede_id,
              rede:redes(id, name)
            )
          )
        `)
        .order('week_start', { ascending: false });
      
      if (celulaId) {
        query = query.eq('celula_id', celulaId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as WeeklyReport[];
    },
  });
}

export function useWeeklyReportsByCoordenacao(coordenacaoId?: string) {
  return useQuery({
    queryKey: ['weekly-reports-coordenacao', coordenacaoId],
    queryFn: async () => {
      const { data: celulas } = await supabase
        .from('celulas')
        .select('id')
        .eq('coordenacao_id', coordenacaoId);
      
      if (!celulas || celulas.length === 0) return [];
      
      const celulaIds = celulas.map(c => c.id);
      
      const { data, error } = await supabase
        .from('weekly_reports')
        .select(`
          *,
          celula:celulas(
            id,
            name,
            coordenacao_id
          )
        `)
        .in('celula_id', celulaIds)
        .order('week_start', { ascending: false });
      
      if (error) throw error;
      return data as unknown as WeeklyReport[];
    },
    enabled: !!coordenacaoId,
  });
}

export function useWeeklyReportsByRede(redeId?: string) {
  return useQuery({
    queryKey: ['weekly-reports-rede', redeId],
    queryFn: async () => {
      const { data: coordenacoes } = await supabase
        .from('coordenacoes')
        .select('id, name')
        .eq('rede_id', redeId);
      
      if (!coordenacoes || coordenacoes.length === 0) return { reports: [], coordenacoes: [] };
      
      const coordenacaoIds = coordenacoes.map(c => c.id);
      
      const { data: celulas } = await supabase
        .from('celulas')
        .select('id, coordenacao_id')
        .in('coordenacao_id', coordenacaoIds);
      
      if (!celulas || celulas.length === 0) return { reports: [], coordenacoes };
      
      const celulaIds = celulas.map(c => c.id);
      
      const { data, error } = await supabase
        .from('weekly_reports')
        .select(`
          *,
          celula:celulas(
            id,
            name,
            coordenacao_id,
            coordenacao:coordenacoes(id, name)
          )
        `)
        .in('celula_id', celulaIds)
        .order('week_start', { ascending: false });
      
      if (error) throw error;
      return { 
        reports: data as unknown as WeeklyReport[], 
        coordenacoes,
        celulas 
      };
    },
    enabled: !!redeId,
  });
}

export function useCreateWeeklyReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: WeeklyReportInput) => {
      const { data, error } = await supabase
        .from('weekly_reports')
        .upsert(input, { onConflict: 'celula_id,week_start' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-reports'] });
    },
  });
}

export function useUpdateWeeklyReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: WeeklyReportInput & { id: string }) => {
      const { data, error } = await supabase
        .from('weekly_reports')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-reports'] });
    },
  });
}
