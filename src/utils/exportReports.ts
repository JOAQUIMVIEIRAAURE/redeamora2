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

// Cores por coordenação (hex)
const COORD_COLORS: Record<number, { fill: string; font: string }> = {
  0: { fill: 'C6EFCE', font: '006100' }, // Verde claro
  1: { fill: 'BDD7EE', font: '1F4E79' }, // Azul claro
  2: { fill: 'FCE4D6', font: 'C65911' }, // Laranja claro
  3: { fill: 'E4DFEC', font: '7030A0' }, // Roxo claro
  4: { fill: 'FFF2CC', font: '806000' }, // Amarelo claro
};

const HEADER_STYLE = {
  fill: { fgColor: { rgb: '4472C4' } },
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  alignment: { horizontal: 'center' },
};

const TOTAL_STYLE = {
  fill: { fgColor: { rgb: 'D9D9D9' } },
  font: { bold: true },
  border: {
    top: { style: 'double' },
    bottom: { style: 'double' },
  },
};

export function exportToExcel({ reports, celulas, coordenacoes, periodLabel }: ExportData) {
  const wb = XLSX.utils.book_new();
  
  // 1. Criar aba de RESUMO GERAL primeiro
  createSummarySheet(wb, reports, celulas, coordenacoes, periodLabel);
  
  // 2. Criar uma aba para cada coordenação
  coordenacoes.forEach((coord, index) => {
    createCoordSheet(wb, coord, reports, celulas, index, periodLabel);
  });
  
  // 3. Criar aba com todos os dados
  createAllDataSheet(wb, reports, celulas, coordenacoes, periodLabel);
  
  // Gerar arquivo
  const fileName = `Relatorio_Rede_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function createSummarySheet(
  wb: XLSX.WorkBook,
  reports: WeeklyReport[],
  celulas: Celula[],
  coordenacoes: Coordenacao[],
  periodLabel: string
) {
  const data: (string | number)[][] = [];
  
  // Título
  data.push(['📊 RESUMO GERAL - RELATÓRIO DA REDE']);
  data.push([`Período: ${periodLabel}`]);
  data.push([`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`]);
  data.push([]);
  
  // Cabeçalhos
  data.push([
    'Coordenação',
    'Qtd Células',
    'Membros Presentes',
    'Líderes em Treinamento',
    'Discipulados',
    'Visitantes',
    'Crianças',
    'Total Geral',
    'Média por Célula'
  ]);
  
  // Dados por coordenação
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
  data.push(['📈 INDICADORES CHAVE (KPIs)']);
  data.push([]);
  data.push(['Total de Células', totalCelulas]);
  data.push(['Total de Coordenações', coordenacoes.length]);
  data.push(['Total de Relatórios', reports.length]);
  data.push(['Média de Membros por Célula', totalCelulas > 0 ? Math.round(grandTotal.members / totalCelulas) : 0]);
  data.push(['Taxa de Visitantes', `${grandTotal.members > 0 ? ((grandTotal.visitors / grandTotal.members) * 100).toFixed(1) : 0}%`]);
  data.push(['Taxa de Discipulado', `${grandTotal.members > 0 ? ((grandTotal.disc / grandTotal.members) * 100).toFixed(1) : 0}%`]);
  
  // Ranking de coordenações
  data.push([]);
  data.push(['🏆 RANKING DE COORDENAÇÕES (por membros presentes)']);
  data.push([]);
  
  const ranking = coordenacoes.map((coord) => {
    const coordCelulas = celulas.filter(c => c.coordenacao_id === coord.id);
    const celulaIds = coordCelulas.map(c => c.id);
    const coordReports = reports.filter(r => celulaIds.includes(r.celula_id));
    const totalMembers = coordReports.reduce((acc, r) => acc + r.members_present, 0);
    return { name: coord.name, members: totalMembers };
  }).sort((a, b) => b.members - a.members);
  
  ranking.forEach((item, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
    data.push([`${medal} ${item.name}`, item.members, 'membros']);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 30 }, // Coordenação
    { wch: 12 }, // Qtd Células
    { wch: 18 }, // Membros
    { wch: 22 }, // Líderes
    { wch: 14 }, // Discipulados
    { wch: 12 }, // Visitantes
    { wch: 12 }, // Crianças
    { wch: 14 }, // Total
    { wch: 16 }, // Média
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'RESUMO GERAL');
}

function createCoordSheet(
  wb: XLSX.WorkBook,
  coord: Coordenacao,
  reports: WeeklyReport[],
  celulas: Celula[],
  colorIndex: number,
  periodLabel: string
) {
  const coordCelulas = celulas.filter(c => c.coordenacao_id === coord.id);
  const celulaIds = coordCelulas.map(c => c.id);
  const coordReports = reports.filter(r => celulaIds.includes(r.celula_id));
  
  const data: (string | number)[][] = [];
  
  // Cabeçalho
  data.push([`📋 ${coord.name.toUpperCase()}`]);
  data.push([`Período: ${periodLabel}`]);
  data.push([`Total de Células: ${coordCelulas.length}`]);
  data.push([]);
  
  // Cabeçalhos da tabela
  data.push([
    'Semana',
    'Célula',
    'Membros Presentes',
    'Líderes em Treinamento',
    'Discipulados',
    'Visitantes',
    'Crianças',
    'Total'
  ]);
  
  // Agrupar por semana
  const weekGroups = new Map<string, WeeklyReport[]>();
  coordReports.forEach(report => {
    const week = report.week_start;
    if (!weekGroups.has(week)) {
      weekGroups.set(week, []);
    }
    weekGroups.get(week)!.push(report);
  });
  
  // Ordenar semanas (mais recente primeiro)
  const sortedWeeks = Array.from(weekGroups.keys()).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  let grandTotals = { members: 0, leaders: 0, disc: 0, visitors: 0, children: 0 };
  
  sortedWeeks.forEach(week => {
    const weekReports = weekGroups.get(week)!;
    const formattedWeek = format(parseISO(week), "dd/MM/yyyy", { locale: ptBR });
    
    // Subtotais da semana
    let weekTotals = { members: 0, leaders: 0, disc: 0, visitors: 0, children: 0 };
    
    weekReports.forEach(report => {
      const celula = coordCelulas.find(c => c.id === report.celula_id);
      const rowTotal = report.members_present + report.leaders_in_training + 
                       report.discipleships + report.visitors + report.children;
      
      data.push([
        formattedWeek,
        celula?.name || 'N/A',
        report.members_present,
        report.leaders_in_training,
        report.discipleships,
        report.visitors,
        report.children,
        rowTotal
      ]);
      
      weekTotals.members += report.members_present;
      weekTotals.leaders += report.leaders_in_training;
      weekTotals.disc += report.discipleships;
      weekTotals.visitors += report.visitors;
      weekTotals.children += report.children;
    });
    
    // Subtotal da semana
    const weekSum = weekTotals.members + weekTotals.leaders + weekTotals.disc + 
                    weekTotals.visitors + weekTotals.children;
    data.push([
      `Subtotal ${formattedWeek}`,
      '',
      weekTotals.members,
      weekTotals.leaders,
      weekTotals.disc,
      weekTotals.visitors,
      weekTotals.children,
      weekSum
    ]);
    data.push([]);
    
    grandTotals.members += weekTotals.members;
    grandTotals.leaders += weekTotals.leaders;
    grandTotals.disc += weekTotals.disc;
    grandTotals.visitors += weekTotals.visitors;
    grandTotals.children += weekTotals.children;
  });
  
  // Total geral da coordenação
  const grandSum = grandTotals.members + grandTotals.leaders + grandTotals.disc + 
                   grandTotals.visitors + grandTotals.children;
  data.push([
    'TOTAL DA COORDENAÇÃO',
    '',
    grandTotals.members,
    grandTotals.leaders,
    grandTotals.disc,
    grandTotals.visitors,
    grandTotals.children,
    grandSum
  ]);
  
  // Médias
  data.push([]);
  data.push(['📊 ESTATÍSTICAS DA COORDENAÇÃO']);
  data.push(['Média de membros por célula', coordCelulas.length > 0 ? Math.round(grandTotals.members / coordCelulas.length) : 0]);
  data.push(['Total de relatórios', coordReports.length]);
  data.push(['Semanas com dados', sortedWeeks.length]);
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 20 }, // Semana
    { wch: 25 }, // Célula
    { wch: 18 }, // Membros
    { wch: 22 }, // Líderes
    { wch: 14 }, // Discipulados
    { wch: 12 }, // Visitantes
    { wch: 12 }, // Crianças
    { wch: 12 }, // Total
  ];
  
  // Nome da aba (máximo 31 caracteres)
  const sheetName = coord.name.length > 28 ? coord.name.substring(0, 28) + '...' : coord.name;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

function createAllDataSheet(
  wb: XLSX.WorkBook,
  reports: WeeklyReport[],
  celulas: Celula[],
  coordenacoes: Coordenacao[],
  periodLabel: string
) {
  const data: (string | number)[][] = [];
  
  // Cabeçalho
  data.push(['📋 DADOS COMPLETOS - TODAS AS COORDENAÇÕES']);
  data.push([`Período: ${periodLabel}`]);
  data.push([]);
  
  // Cabeçalhos
  data.push([
    'Coordenação',
    'Célula',
    'Semana',
    'Membros Presentes',
    'Líderes em Treinamento',
    'Discipulados',
    'Visitantes',
    'Crianças',
    'Total'
  ]);
  
  // Ordenar por coordenação, célula e data
  const sortedReports = [...reports].sort((a, b) => {
    const celulaA = celulas.find(c => c.id === a.celula_id);
    const celulaB = celulas.find(c => c.id === b.celula_id);
    const coordA = coordenacoes.find(co => co.id === celulaA?.coordenacao_id);
    const coordB = coordenacoes.find(co => co.id === celulaB?.coordenacao_id);
    
    // Primeiro por coordenação
    const coordCompare = (coordA?.name || '').localeCompare(coordB?.name || '');
    if (coordCompare !== 0) return coordCompare;
    
    // Depois por célula
    const celulaCompare = (celulaA?.name || '').localeCompare(celulaB?.name || '');
    if (celulaCompare !== 0) return celulaCompare;
    
    // Por último, por data (mais recente primeiro)
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
  
  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 25 }, // Coordenação
    { wch: 25 }, // Célula
    { wch: 14 }, // Semana
    { wch: 18 }, // Membros
    { wch: 22 }, // Líderes
    { wch: 14 }, // Discipulados
    { wch: 12 }, // Visitantes
    { wch: 12 }, // Crianças
    { wch: 10 }, // Total
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'DADOS COMPLETOS');
}
