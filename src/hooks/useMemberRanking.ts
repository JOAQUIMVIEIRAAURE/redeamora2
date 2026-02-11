import { useMemo } from 'react';
import { Member } from './useMembers';
import { differenceInMonths } from 'date-fns';

export interface RankedMember {
  memberId: string;
  name: string;
  celulaId: string;
  celulaName: string;
  joinedChurchAt: string | null;
  monthsInChurch: number;
  milestones: {
    batismo: boolean;
    encontro_com_deus: boolean;
    renovo: boolean;
    encontro_de_casais: boolean;
    curso_lidere: boolean;
    is_discipulado: boolean;
    is_lider_em_treinamento: boolean;
  };
  milestonesCount: number;
  milestonesScore: number;
  timeScore: number;
  totalScore: number;
}

const MILESTONE_POINTS = 10;

export function useMemberRanking(members: Member[] | undefined) {
  return useMemo(() => {
    if (!members) return [];

    const now = new Date();

    return members
      .filter(m => m.is_active && m.profile)
      .map((m): RankedMember => {
        const milestones = {
          batismo: !!m.batismo,
          encontro_com_deus: !!m.encontro_com_deus,
          renovo: !!m.renovo,
          encontro_de_casais: !!m.encontro_de_casais,
          curso_lidere: !!m.curso_lidere,
          is_discipulado: !!m.is_discipulado,
          is_lider_em_treinamento: !!m.is_lider_em_treinamento,
        };

        const milestonesCount = Object.values(milestones).filter(Boolean).length;
        const milestonesScore = milestonesCount * MILESTONE_POINTS;

        const joinedChurchAt = m.profile?.joined_church_at || null;
        const monthsInChurch = joinedChurchAt
          ? Math.max(0, differenceInMonths(now, new Date(joinedChurchAt)))
          : 0;

        return {
          memberId: m.id,
          name: m.profile?.name || 'Sem nome',
          celulaId: m.celula_id,
          celulaName: m.celula?.name || '',
          joinedChurchAt,
          monthsInChurch,
          milestones,
          milestonesCount,
          milestonesScore,
          timeScore: monthsInChurch,
          totalScore: monthsInChurch + milestonesScore,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [members]);
}
