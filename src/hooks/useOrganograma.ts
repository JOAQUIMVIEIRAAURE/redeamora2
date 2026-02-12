import { useRedes } from './useRedes';
import { useCoordenacoes } from './useCoordenacoes';
import { useSupervisores } from './useSupervisoes';
import { useCelulas } from './useCelulas';
import { useMemo } from 'react';

export interface OrgNode {
  id: string;
  type: 'rede' | 'coordenacao' | 'supervisor' | 'celula';
  name: string;
  coupleName: string | null;
  childrenCount: number;
  children: OrgNode[];
}

export function useOrganograma() {
  const { data: redes, isLoading: l1 } = useRedes();
  const { data: coordenacoes, isLoading: l2 } = useCoordenacoes();
  const { data: supervisores, isLoading: l3 } = useSupervisores();
  const { data: celulas, isLoading: l4 } = useCelulas();

  const isLoading = l1 || l2 || l3 || l4;

  const tree = useMemo(() => {
    if (!redes || !coordenacoes || !celulas) return [];

    return redes.map((rede): OrgNode => {
      const redeCoords = coordenacoes.filter(c => c.rede_id === rede.id);

      const coordNodes: OrgNode[] = redeCoords.map((coord): OrgNode => {
        // Get supervisors for this coordenacao
        const coordSupervisors = (supervisores || []).filter(s => s.coordenacao_id === coord.id);

        // Get cells for this coordenacao
        const coordCelulas = celulas.filter(c => c.coordenacao_id === coord.id);

        // Build supervisor nodes
        const supervisorNodes: OrgNode[] = coordSupervisors.map((sup): OrgNode => {
          // Supervisors don't directly own cells in current schema,
          // but we show them as a level
          return {
            id: sup.id,
            type: 'supervisor',
            name: sup.profile?.name || 'Supervisor',
            coupleName: sup.profile?.name || null,
            childrenCount: 0,
            children: [],
          };
        });

        // Build cell nodes
        const celulaNodes: OrgNode[] = coordCelulas.map((cel): OrgNode => {
          const couple = cel.leadership_couple;
          const coupleName = couple?.spouse1?.name && couple?.spouse2?.name
            ? `${couple.spouse1.name} & ${couple.spouse2.name}`
            : couple?.spouse1?.name || couple?.spouse2?.name || null;

          return {
            id: cel.id,
            type: 'celula',
            name: cel.name,
            coupleName,
            childrenCount: 0,
            children: [],
          };
        });

        const couple = coord.leadership_couple;
        const coupleName = couple?.spouse1?.name && couple?.spouse2?.name
          ? `${couple.spouse1.name} & ${couple.spouse2.name}`
          : couple?.spouse1?.name || couple?.spouse2?.name || null;

        // Combine supervisors and cells as children
        const allChildren = [...supervisorNodes, ...celulaNodes];

        return {
          id: coord.id,
          type: 'coordenacao',
          name: coord.name,
          coupleName,
          childrenCount: allChildren.length,
          children: allChildren,
        };
      });

      const redeCouple = rede.leadership_couple;
      const redeCoupleName = redeCouple?.spouse1?.name && redeCouple?.spouse2?.name
        ? `${redeCouple.spouse1.name} & ${redeCouple.spouse2.name}`
        : redeCouple?.spouse1?.name || redeCouple?.spouse2?.name || null;

      return {
        id: rede.id,
        type: 'rede',
        name: rede.name,
        coupleName: redeCoupleName,
        childrenCount: coordNodes.length,
        children: coordNodes,
      };
    });
  }, [redes, coordenacoes, supervisores, celulas]);

  return { tree, isLoading };
}
