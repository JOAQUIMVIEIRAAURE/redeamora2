import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from './useProfiles';

export interface LeadershipCouple {
  id: string;
  spouse1_id: string;
  spouse2_id: string;
  created_at: string;
  updated_at: string;
  spouse1?: Profile | null;
  spouse2?: Profile | null;
}

export function useLeadershipCouples() {
  return useQuery({
    queryKey: ['leadership_couples'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leadership_couples')
        .select(`
          *,
          spouse1:profiles!leadership_couples_spouse1_id_fkey(*),
          spouse2:profiles!leadership_couples_spouse2_id_fkey(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LeadershipCouple[];
    },
  });
}

export function useLeadershipCouple(id?: string) {
  return useQuery({
    queryKey: ['leadership_couple', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leadership_couples')
        .select(`
          *,
          spouse1:profiles!leadership_couples_spouse1_id_fkey(*),
          spouse2:profiles!leadership_couples_spouse2_id_fkey(*)
        `)
        .eq('id', id!)
        .single();
      
      if (error) throw error;
      return data as LeadershipCouple;
    },
    enabled: !!id,
  });
}

export function useCreateLeadershipCouple() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (couple: { spouse1_id: string; spouse2_id: string }) => {
      const { data, error } = await supabase
        .from('leadership_couples')
        .insert(couple)
        .select(`
          *,
          spouse1:profiles!leadership_couples_spouse1_id_fkey(*),
          spouse2:profiles!leadership_couples_spouse2_id_fkey(*)
        `)
        .single();
      
      if (error) throw error;
      return data as LeadershipCouple;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership_couples'] });
      toast({ title: 'Casal de liderança criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar casal', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateLeadershipCouple() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...couple }: { id: string; spouse1_id: string; spouse2_id: string }) => {
      const { data, error } = await supabase
        .from('leadership_couples')
        .update(couple)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership_couples'] });
      toast({ title: 'Casal atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar casal', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteLeadershipCouple() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leadership_couples')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership_couples'] });
      toast({ title: 'Casal removido!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover casal', description: error.message, variant: 'destructive' });
    },
  });
}

// Helper to get display name for a couple
export function getCoupleDisplayName(couple?: LeadershipCouple | null): string {
  if (!couple) return '';
  const name1 = couple.spouse1?.name || 'Cônjuge 1';
  const name2 = couple.spouse2?.name || 'Cônjuge 2';
  return `${name1} e ${name2}`;
}
