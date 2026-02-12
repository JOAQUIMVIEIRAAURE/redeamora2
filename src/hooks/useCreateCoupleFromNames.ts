import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useCreateCoupleFromNames() {
  const queryClient = useQueryClient();

  async function createOrUpdateCouple(
    spouse1Name: string,
    spouse2Name: string,
    existingCoupleId?: string | null
  ): Promise<string | null> {
    if (!spouse1Name.trim() || !spouse2Name.trim()) return null;

    // If editing an existing couple, update the profile names
    if (existingCoupleId) {
      const { data: couple } = await supabase
        .from('leadership_couples')
        .select('spouse1_id, spouse2_id')
        .eq('id', existingCoupleId)
        .single();

      if (couple) {
        await Promise.all([
          supabase.from('profiles').update({ name: spouse1Name.trim() }).eq('id', couple.spouse1_id),
          supabase.from('profiles').update({ name: spouse2Name.trim() }).eq('id', couple.spouse2_id),
        ]);
        queryClient.invalidateQueries({ queryKey: ['leadership_couples'] });
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
        return existingCoupleId;
      }
    }

    // Create new profiles with generated user_ids
    const userId1 = crypto.randomUUID();
    const userId2 = crypto.randomUUID();

    const [{ data: profile1, error: e1 }, { data: profile2, error: e2 }] = await Promise.all([
      supabase.from('profiles').insert({ name: spouse1Name.trim(), user_id: userId1 }).select('id').single(),
      supabase.from('profiles').insert({ name: spouse2Name.trim(), user_id: userId2 }).select('id').single(),
    ]);

    if (e1 || e2 || !profile1 || !profile2) {
      throw new Error('Erro ao criar perfis do casal');
    }

    const { data: couple, error: coupleErr } = await supabase
      .from('leadership_couples')
      .insert({ spouse1_id: profile1.id, spouse2_id: profile2.id })
      .select('id')
      .single();

    if (coupleErr || !couple) {
      throw new Error('Erro ao criar casal de liderança');
    }

    queryClient.invalidateQueries({ queryKey: ['leadership_couples'] });
    queryClient.invalidateQueries({ queryKey: ['profiles'] });

    return couple.id;
  }

  return { createOrUpdateCouple };
}
