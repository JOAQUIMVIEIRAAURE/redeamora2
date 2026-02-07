import * as XLSX from 'xlsx';
import { WeeklyReport } from '@/hooks/useWeeklyReports';
import { Celula } from '@/hooks/useCelulas';
import { Coordenacao } from '@/hooks/useCoordenacoes';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExportData {
  reports: WeeklyReport[];
  celulas: Celula[];
  coordenacoes: Coordenacao[];
  periodLabel: string;
}

export function exportToExcel({ reports, celulas, coordenacoes, periodLabel }: ExportData) {
  const wb = XLSX.utils.book_new();
  
  // 1. Aba principal: DADOS (formato ideal para filtros e tabelas dinâmicas do Google Sheets)
  createMainDataSheet(wb, reports, celulas, coordenacoes, periodLabel);
  
  // 2. Aba de RESUMO por coordenação
  createSummarySheet(wb, reports, celulas, coordenacoes, periodLabel);
  
  // 3. Uma aba para cada coordenação
  coordenacoes.forEach((coord) => {
    createCoordSheet(wb, coord, reports, celulas, periodLabel);
  });
  
  // Gerar arquivo
  const fileName = `Relatorio_Rede_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Aba principal com estrutura otimizada para Google Sheets (filtros e tabelas dinâmicas)
function createMainDataSheet(
  wb: XLSX.WorkBook,
  reports: WeeklyReport[],
  celulas: Celula[],
  coordenacoes: Coordenacao[],
  periodLabel: string
) {
  const data: (string | number)[][] = [];
  
  // Cabeçalhos na primeira linha (essencial para filtros do Google Sheets)
  data.push([
    'Coordenacao',
    'Celula',
    'Semana',
    'Data Formatada',
    'Membros Presentes',
    'Lideres em Treinamento',
    'Discipulados',
    'Visitantes',
    'Criancas',
    'Total'
  ]);
  
  // Ordenar por coordenação, célula e data
  const sortedReports = [...reports].sort((a, b) => {
    const celulaA = celulas.find(c => c.id === a.celula_id);
    const celulaB = celulas.find(c => c.id === b.celula_id);
    const coordA = coordenacoes.find(co => co.id === celulaA?.coordenacao_id);
    const coordB = coordenacoes.find(co => co.id === celulaB?.coordenacao_id);
    
    const coordCompare = (coordA?.name || '').localeCompare(coordB?.name || '');
    if (coordCompare !== 0) return coordCompare;
    
    const celulaCompare = (celulaA?.name || '').localeCompare(celulaB?.name || '');
    if (celulaCompare !== 0) return celulaCompare;
    
    return new Date(b.week_start).getTime() - new Date(a.week_start).getTime();
  });
  
  sortedReports.forEach(report => {
    const celula = celulas.find(c => c.id === report.celula_id);
    const coord = coordenacoes.find(co => co.id === celula?.coordenacao_id);
    const rowTotal = report.members_present + report.leaders_in_training + 
                     report.discipleships + report.visitors + report.children;
    
    data.push([
      coord?.name || 'N/A',
      celula?.name || 'N/A',
      report.week_start, // ISO format for sorting
      format(parseISO(report.week_start), "dd/MM/yyyy", { locale: ptBR }),
      report.members_present,
      report.leaders_in_training,
      report.discipleships,
      report.visitors,
      report.children,
      rowTotal
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Largura das colunas
  ws['!cols'] = [
    { wch: 25 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
  ];
  
  // Configurar auto-filtro (funciona no Google Sheets)
  ws['!autofilter'] = { ref: `A1:J${data.length}` };
  
  XLSX.utils.book_append_sheet(wb, ws, 'DADOS');
}

// Resumo consolidado
function createSummarySheet(
  wb: XLSX.WorkBook,
  reports: WeeklyReport[],
  celulas: Celula[],
  coordenacoes: Coordenacao[],
  periodLabel: string
) {
  const data: (string | number)[][] = [];
  
  // Info do relatório
  data.push(['RESUMO GERAL - RELATORIO DA REDE']);
  data.push(['Periodo:', periodLabel]);
  data.push(['Gerado em:', format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })]);
  data.push([]);
  
  // Tabela de resumo por coordenação
  data.push([
    'Coordenacao',
    'Qtd Celulas',
    'Membros Presentes',
    'Lideres em Treinamento',
    'Discipulados',
    'Visitantes',
    'Criancas',
    'Total Geral',
    'Media por Celula'
  ]);
  
  let grandTotal = { members: 0, leaders: 0, disc: 0, visitors: 0, children: 0 };
  let totalCelulas = 0;
  
  coordenacoes.forEach((coord) => {
    const coordCelulas = celulas.filter(c => c.coordenacao_id === coord.id);
    const celulaIds = coordCelulas.map(c => c.id);
    const coordReports = reports.filter(r => celulaIds.includes(r.celula_id));
    
    const totals = coordReports.reduce((acc, r) => ({
      members: acc.members + r.members_present,
      leaders: acc.leaders + r.leaders_in_training,
      disc: acc.disc + r.discipleships,
      visitors: acc.visitors + r.visitors,
      children: acc.children + r.children,
    }), { members: 0, leaders: 0, disc: 0, visitors: 0, children: 0 });
    
    const total = totals.members + totals.leaders + totals.disc + totals.visitors + totals.children;
    const avgPerCelula = coordCelulas.length > 0 ? Math.round(total / coordCelulas.length) : 0;
    
    data.push([
      coord.name,
      coordCelulas.length,
      totals.members,
      totals.leaders,
      totals.disc,
      totals.visitors,
      totals.children,
      total,
      avgPerCelula
    ]);
    
    grandTotal.members += totals.members;
    grandTotal.leaders += totals.leaders;
    grandTotal.disc += totals.disc;
    grandTotal.visitors += totals.visitors;
    grandTotal.children += totals.children;
    totalCelulas += coordCelulas.length;
  });
  
  // Linha de totais
  const grandTotalSum = grandTotal.members + grandTotal.leaders + grandTotal.disc + grandTotal.visitors + grandTotal.children;
  data.push([]);
  data.push([
    'TOTAL GERAL',
    totalCelulas,
    grandTotal.members,
    grandTotal.leaders,
    grandTotal.disc,
    grandTotal.visitors,
    grandTotal.children,
    grandTotalSum,
    totalCelulas > 0 ? Math.round(grandTotalSum / totalCelulas) : 0
  ]);
  
  // KPIs
  data.push([]);
  data.push(['INDICADORES CHAVE']);
  data.push(['Total de Celulas', totalCelulas]);
  data.push(['Total de Coordenacoes', coordenacoes.length]);
  data.push(['Total de Relatorios', reports.length]);
  data.push(['Media de Membros por Celula', totalCelulas > 0 ? Math.round(grandTotal.members / totalCelulas) : 0]);
  data.push(['Taxa de Visitantes (%)', grandTotal.members > 0 ? Number(((grandTotal.visitors / grandTotal.members) * 100).toFixed(1)) : 0]);
  data.push(['Taxa de Discipulado (%)', grandTotal.members > 0 ? Number(((grandTotal.disc / grandTotal.members) * 100).toFixed(1)) : 0]);
  
  // Ranking
  data.push([]);
  data.push(['RANKING DE COORDENACOES (por membros presentes)']);
  data.push(['Posicao', 'Coordenacao', 'Total Membros']);
  
  const ranking = coordenacoes.map((coord) => {
    const coordCelulas = celulas.filter(c => c.coordenacao_id === coord.id);
    const celulaIds = coordCelulas.map(c => c.id);
    const coordReports = reports.filter(r => celulaIds.includes(r.celula_id));
    const totalMembers = coordReports.reduce((acc, r) => acc + r.members_present, 0);
    return { name: coord.name, members: totalMembers };
  }).sort((a, b) => b.members - a.members);
  
  ranking.forEach((item, index) => {
    data.push([index + 1, item.name, item.members]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 30 },
    { wch: 12 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'RESUMO');
}

// Aba individual por coordenação
function createCoordSheet(
  wb: XLSX.WorkBook,
  coord: Coordenacao,
  reports: WeeklyReport[],
  celulas: Celula[],
  periodLabel: string
) {
  const coordCelulas = celulas.filter(c => c.coordenacao_id === coord.id);
  const celulaIds = coordCelulas.map(c => c.id);
  const coordReports = reports.filter(r => celulaIds.includes(r.celula_id));
  
  const data: (string | number)[][] = [];
  
  // Info
  data.push([coord.name.toUpperCase()]);
  data.push(['Periodo:', periodLabel]);
  data.push(['Total de Celulas:', coordCelulas.length]);
  data.push([]);
  
  // Cabeçalhos (na linha 5 para filtros)
  data.push([
    'Semana',
    'Data',
    'Celula',
    'Membros Presentes',
    'Lideres em Treinamento',
    'Discipulados',
    'Visitantes',
    'Criancas',
    'Total'
  ]);
  
  // Ordenar por data (mais recente primeiro) e célula
  const sortedReports = [...coordReports].sort((a, b) => {
    const dateCompare = new Date(b.week_start).getTime() - new Date(a.week_start).getTime();
    if (dateCompare !== 0) return dateCompare;
    
    const celulaA = coordCelulas.find(c => c.id === a.celula_id);
    const celulaB = coordCelulas.find(c => c.id === b.celula_id);
    return (celulaA?.name || '').localeCompare(celulaB?.name || '');
  });
  
  let grandTotals = { members: 0, leaders: 0, disc: 0, visitors: 0, children: 0 };
  
  sortedReports.forEach(report => {
    const celula = coordCelulas.find(c => c.id === report.celula_id);
    const rowTotal = report.members_present + report.leaders_in_training + 
                     report.discipleships + report.visitors + report.children;
    
    data.push([
      report.week_start,
      format(parseISO(report.week_start), "dd/MM/yyyy", { locale: ptBR }),
      celula?.name || 'N/A',
      report.members_present,
      report.leaders_in_training,
      report.discipleships,
      report.visitors,
      report.children,
      rowTotal
    ]);
    
    grandTotals.members += report.members_present;
    grandTotals.leaders += report.leaders_in_training;
    grandTotals.disc += report.discipleships;
    grandTotals.visitors += report.visitors;
    grandTotals.children += report.children;
  });
  
  // Totais
  const grandSum = grandTotals.members + grandTotals.leaders + grandTotals.disc + 
                   grandTotals.visitors + grandTotals.children;
  data.push([]);
  data.push([
    'TOTAL',
    '',
    '',
    grandTotals.members,
    grandTotals.leaders,
    grandTotals.disc,
    grandTotals.visitors,
    grandTotals.children,
    grandSum
  ]);
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
  ];
  
  // Nome da aba (máximo 31 caracteres, sem caracteres especiais)
  const sheetName = coord.name
    .replace(/[^\w\s-]/g, '')
    .substring(0, 28)
    .trim();
  
  XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Coordenacao');
}
