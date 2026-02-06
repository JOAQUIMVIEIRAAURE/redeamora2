import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Member } from './useMembers';

export interface Casal {
  id: string;
  celula_id: string;
  member1_id: string;
  member2_id: string;
  created_at: string;
  updated_at: string;
  member1?: Member | null;
  member2?: Member | null;
}

export function useCasais(celulaId?: string) {
  return useQuery({
    queryKey: ['casais', celulaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('casais')
        .select('*')
        .eq('celula_id', celulaId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch member details for each casal
      const casaisWithMembers = await Promise.all(
        (data || []).map(async (casal) => {
          const [member1Res, member2Res] = await Promise.all([
            supabase
              .from('members')
              .select('*, profile:profiles!members_profile_id_fkey(id, name, avatar_url, email)')
              .eq('id', casal.member1_id)
              .single(),
            supabase
              .from('members')
              .select('*, profile:profiles!members_profile_id_fkey(id, name, avatar_url, email)')
              .eq('id', casal.member2_id)
              .single(),
          ]);
          
          return {
            ...casal,
            member1: member1Res.data as Member | null,
            member2: member2Res.data as Member | null,
          };
        })
      );
      
      return casaisWithMembers as Casal[];
    },
    enabled: !!celulaId,
  });
}

export function useCreateCasal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (casal: { celula_id: string; member1_id: string; member2_id: string }) => {
      const { data, error } = await supabase
        .from('casais')
        .insert(casal)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casais'] });
      toast({ title: 'Casal vinculado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao vincular casal', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCasal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('casais')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casais'] });
      toast({ title: 'Vínculo de casal removido!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover vínculo', description: error.message, variant: 'destructive' });
    },
  });
}
