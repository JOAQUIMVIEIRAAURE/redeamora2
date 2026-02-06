import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Member = Tables<'members'> & {
  profile?: { id: string; name: string; avatar_url: string | null; email: string | null } | null;
  celula?: { id: string; name: string } | null;
};

export function useMembers(celulaId?: string) {
  return useQuery({
    queryKey: ['members', celulaId],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select(`
          *,
          profile:profiles!members_profile_id_fkey(id, name, avatar_url, email),
          celula:celulas!members_celula_id_fkey(id, name)
        `)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });
      
      if (celulaId) {
        query = query.eq('celula_id', celulaId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Member[];
    },
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (member: TablesInsert<'members'>) => {
      const { data, error } = await supabase
        .from('members')
        .insert(member)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['celulas'] });
      toast({ title: 'Membro adicionado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar membro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...member }: TablesUpdate<'members'> & { id: string }) => {
      const { data, error } = await supabase
        .from('members')
        .update(member)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['celulas'] });
      toast({ title: 'Membro atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar membro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete - just set is_active to false
      const { error } = await supabase
        .from('members')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['celulas'] });
      toast({ title: 'Membro removido com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover membro', description: error.message, variant: 'destructive' });
    },
  });
}
