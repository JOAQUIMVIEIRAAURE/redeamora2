import { useMemo } from 'react';
import { WeeklyReport } from './useWeeklyReports';
import { Celula } from './useCelulas';
import { Coordenacao } from './useCoordenacoes';
import { Rede } from './useRedes';
import { Member } from './useMembers';
import { getCoupleDisplayName } from './useLeadershipCouples';

export interface RedeAggregation {
  id: string;
  name: string;
  leaderCouple: string;
  coordenacoesCount: number;
  celulasCount: number;
  membersCount: number;
  visitors: number;
  reportsCount: number;
  submissionRate: number;
}

export interface CoordenacaoAggregation {
  id: string;
  name: string;
  redeName: string;
  leaderCouple: string;
  celulasCount: number;
  membersCount: number;
  visitors: number;
  reportsCount: number;
  submissionRate: number;
}

export interface CelulaAggregation {
  id: string;
  name: string;
  coordenacaoName: string;
  leaderCouple: string;
  membersCount: number;
  visitors: number;
  reportsCount: number;
}

export interface LiderAggregation {
  coupleId: string;
  coupleName: string;
  celulaName: string;
  reportsCount: number;
  avgVisitors: number;
  totalMembers: number;
}

export function useDadosAggregations(
  redes: Rede[] | undefined,
  coordenacoes: Coordenacao[] | undefined,
  celulas: Celula[] | undefined,
  members: Member[] | undefined,
  reports: WeeklyReport[] | undefined,
) {
  return useMemo(() => {
    if (!redes || !coordenacoes || !celulas) {
      return { byRede: [], byCoordenacao: [], byCelula: [], byLider: [], kpis: null };
    }

    const allReports = reports || [];
    const allMembers = members || [];

    // Members count per celula
    const membersByCelula: Record<string, number> = {};
    allMembers.forEach(m => {
      if (m.is_active) {
        membersByCelula[m.celula_id] = (membersByCelula[m.celula_id] || 0) + 1;
      }
    });

    // Reports per celula
    const reportsByCelula: Record<string, WeeklyReport[]> = {};
    allReports.forEach(r => {
      if (!reportsByCelula[r.celula_id]) reportsByCelula[r.celula_id] = [];
      reportsByCelula[r.celula_id].push(r);
    });

    // Celulas per coordenacao
    const celulasByCoord: Record<string, Celula[]> = {};
    celulas.forEach(c => {
      if (!celulasByCoord[c.coordenacao_id]) celulasByCoord[c.coordenacao_id] = [];
      celulasByCoord[c.coordenacao_id].push(c);
    });

    // Coordenacoes per rede
    const coordsByRede: Record<string, Coordenacao[]> = {};
    coordenacoes.forEach(c => {
      if (!coordsByRede[c.rede_id]) coordsByRede[c.rede_id] = [];
      coordsByRede[c.rede_id].push(c);
    });

    // By Rede
    const byRede: RedeAggregation[] = redes.map(rede => {
      const redeCoords = coordsByRede[rede.id] || [];
      const redeCelulas = redeCoords.flatMap(c => celulasByCoord[c.id] || []);
      const totalMembers = redeCelulas.reduce((s, c) => s + (membersByCelula[c.id] || 0), 0);
      const totalVisitors = redeCelulas.reduce((s, c) => s + (reportsByCelula[c.id] || []).reduce((vs, r) => vs + r.visitors, 0), 0);
      const totalReports = redeCelulas.reduce((s, c) => s + (reportsByCelula[c.id] || []).length, 0);
      const celulasWithReports = redeCelulas.filter(c => (reportsByCelula[c.id] || []).length > 0).length;

      return {
        id: rede.id,
        name: rede.name,
        leaderCouple: getCoupleDisplayName(rede.leadership_couple),
        coordenacoesCount: redeCoords.length,
        celulasCount: redeCelulas.length,
        membersCount: totalMembers,
        visitors: totalVisitors,
        reportsCount: totalReports,
        submissionRate: redeCelulas.length > 0 ? Math.round((celulasWithReports / redeCelulas.length) * 100) : 0,
      };
    });

    // By Coordenacao
    const byCoordenacao: CoordenacaoAggregation[] = coordenacoes.map(coord => {
      const coordCelulas = celulasByCoord[coord.id] || [];
      const rede = redes.find(r => r.id === coord.rede_id);
      const totalMembers = coordCelulas.reduce((s, c) => s + (membersByCelula[c.id] || 0), 0);
      const totalVisitors = coordCelulas.reduce((s, c) => s + (reportsByCelula[c.id] || []).reduce((vs, r) => vs + r.visitors, 0), 0);
      const totalReports = coordCelulas.reduce((s, c) => s + (reportsByCelula[c.id] || []).length, 0);
      const celulasWithReports = coordCelulas.filter(c => (reportsByCelula[c.id] || []).length > 0).length;

      return {
        id: coord.id,
        name: coord.name,
        redeName: rede?.name || '—',
        leaderCouple: getCoupleDisplayName(coord.leadership_couple),
        celulasCount: coordCelulas.length,
        membersCount: totalMembers,
        visitors: totalVisitors,
        reportsCount: totalReports,
        submissionRate: coordCelulas.length > 0 ? Math.round((celulasWithReports / coordCelulas.length) * 100) : 0,
      };
    });

    // By Celula
    const byCelula: CelulaAggregation[] = celulas.map(celula => {
      const coord = coordenacoes.find(c => c.id === celula.coordenacao_id);
      const celulaReports = reportsByCelula[celula.id] || [];
      const totalVisitors = celulaReports.reduce((s, r) => s + r.visitors, 0);

      return {
        id: celula.id,
        name: celula.name,
        coordenacaoName: coord?.name || '—',
        leaderCouple: getCoupleDisplayName(celula.leadership_couple),
        membersCount: membersByCelula[celula.id] || 0,
        visitors: totalVisitors,
        reportsCount: celulaReports.length,
      };
    });

    // By Lider
    const byLider: LiderAggregation[] = celulas
      .filter(c => c.leadership_couple)
      .map(celula => {
        const celulaReports = reportsByCelula[celula.id] || [];
        const totalVisitors = celulaReports.reduce((s, r) => s + r.visitors, 0);

        return {
          coupleId: celula.leadership_couple!.id,
          coupleName: getCoupleDisplayName(celula.leadership_couple),
          celulaName: celula.name,
          reportsCount: celulaReports.length,
          avgVisitors: celulaReports.length > 0 ? Math.round(totalVisitors / celulaReports.length) : 0,
          totalMembers: membersByCelula[celula.id] || 0,
        };
      });

    // KPIs
    const totalActiveMembers = allMembers.filter(m => m.is_active).length;
    const totalVisitors = allReports.reduce((s, r) => s + r.visitors, 0);

    const kpis = {
      totalCelulas: celulas.length,
      totalMembers: totalActiveMembers,
      totalVisitors,
      totalReports: allReports.length,
    };

    return { byRede, byCoordenacao, byCelula, byLider, kpis };
  }, [redes, coordenacoes, celulas, members, reports]);
}
