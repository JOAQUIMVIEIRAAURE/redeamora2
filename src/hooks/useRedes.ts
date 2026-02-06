import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Rede = Tables<'redes'> & {
  leader?: { id: string; name: string; avatar_url: string | null } | null;
  _count?: { coordenacoes: number };
};

export function useRedes() {
  return useQuery({
    queryKey: ['redes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('redes')
        .select(`
          *,
          leader:profiles!redes_leader_id_fkey(id, name, avatar_url)
        `)
        .order('name');
      
      if (error) throw error;
      
      // Get coordenacao counts
      const { data: coordCounts } = await supabase
        .from('coordenacoes')
        .select('rede_id');
      
      const countMap = coordCounts?.reduce((acc, c) => {
        acc[c.rede_id] = (acc[c.rede_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      return data.map(r => ({
        ...r,
        _count: { coordenacoes: countMap[r.id] || 0 }
      })) as Rede[];
    },
  });
}

export function useCreateRede() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rede: TablesInsert<'redes'>) => {
      const { data, error } = await supabase
        .from('redes')
        .insert(rede)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redes'] });
      toast({ title: 'Rede criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar rede', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateRede() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...rede }: TablesUpdate<'redes'> & { id: string }) => {
      const { data, error } = await supabase
        .from('redes')
        .update(rede)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redes'] });
      toast({ title: 'Rede atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar rede', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteRede() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('redes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redes'] });
      toast({ title: 'Rede excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir rede', description: error.message, variant: 'destructive' });
    },
  });
}
