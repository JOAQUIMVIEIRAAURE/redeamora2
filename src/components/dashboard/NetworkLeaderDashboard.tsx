import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Heart, UserPlus, Baby, Loader2, Network, Download } from 'lucide-react';
import { useRedes } from '@/hooks/useRedes';
import { useWeeklyReportsByRede, WeeklyReport } from '@/hooks/useWeeklyReports';
import { useToast } from '@/hooks/use-toast';
import { WeekSelector, getWeekStartString } from './WeekSelector';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NetworkLeaderDashboard() {
  const { toast } = useToast();
  const { data: redes, isLoading: redesLoading } = useRedes();
  
  const [selectedRede, setSelectedRede] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const weekStart = getWeekStartString(selectedWeek);
  
  const { data: redeData, isLoading: reportsLoading } = useWeeklyReportsByRede(selectedRede);

  // Show all redes in controlled environment
  const userRedes = redes || [];

  // Filter reports for selected week
  const currentWeekReports = redeData?.reports?.filter(r => r.week_start === weekStart) || [];

  // Define type for coordenacao data
  interface CoordenacaoData {
    name: string;
    reports: WeeklyReport[];
    totals: {
      members_present: number;
      leaders_in_training: number;
      discipleships: number;
      visitors: number;
      children: number;
    };
  }

  // Group reports by coordenacao
  const reportsByCoordenacao = currentWeekReports.reduce<Record<string, CoordenacaoData>>((acc, report) => {
    const coordId = report.celula?.coordenacao_id;
    const coordName = report.celula?.coordenacao?.name || 'Sem Coordenação';
    if (!coordId) return acc;
    
    if (!acc[coordId]) {
      acc[coordId] = {
        name: coordName,
        reports: [],
        totals: {
          members_present: 0,
          leaders_in_training: 0,
          discipleships: 0,
          visitors: 0,
          children: 0,
        }
      };
    }
    
    acc[coordId].reports.push(report);
    acc[coordId].totals.members_present += report.members_present;
    acc[coordId].totals.leaders_in_training += report.leaders_in_training;
    acc[coordId].totals.discipleships += report.discipleships;
    acc[coordId].totals.visitors += report.visitors;
    acc[coordId].totals.children += report.children;
    
    return acc;
  }, {});

  // Calculate grand totals
  const grandTotals = Object.values(reportsByCoordenacao).reduce((acc, coord) => ({
    members_present: acc.members_present + coord.totals.members_present,
    leaders_in_training: acc.leaders_in_training + coord.totals.leaders_in_training,
    discipleships: acc.discipleships + coord.totals.discipleships,
    visitors: acc.visitors + coord.totals.visitors,
    children: acc.children + coord.totals.children,
  }), {
    members_present: 0,
    leaders_in_training: 0,
    discipleships: 0,
    visitors: 0,
    children: 0,
  });

  const formatWeekDisplay = () => {
    const weekEnd = new Date(selectedWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return `${format(selectedWeek, "dd/MM/yyyy", { locale: ptBR })} - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  const exportToCSV = () => {
    if (!currentWeekReports.length) {
      toast({
        title: 'Aviso',
        description: 'Nenhum dado para exportar',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Coordenação', 'Célula', 'Membros Presentes', 'Líderes em Treinamento', 'Discipulados', 'Visitantes', 'Crianças', 'Total'];
    
    const rows = currentWeekReports.map(report => {
      const total = report.members_present + report.leaders_in_training + 
        report.discipleships + report.visitors + report.children;
      return [
        report.celula?.coordenacao?.name || '',
        report.celula?.name || '',
        report.members_present,
        report.leaders_in_training,
        report.discipleships,
        report.visitors,
        report.children,
        total
      ];
    });

    // Add totals row per coordenacao
    Object.entries(reportsByCoordenacao).forEach(([_, coord]) => {
      const total = coord.totals.members_present + coord.totals.leaders_in_training + 
        coord.totals.discipleships + coord.totals.visitors + coord.totals.children;
      rows.push([
        `TOTAL ${coord.name}`,
        '',
        coord.totals.members_present,
        coord.totals.leaders_in_training,
        coord.totals.discipleships,
        coord.totals.visitors,
        coord.totals.children,
        total
      ]);
    });

    // Add grand total
    const grandTotal = grandTotals.members_present + grandTotals.leaders_in_training + 
      grandTotals.discipleships + grandTotals.visitors + grandTotals.children;
    rows.push([
      'TOTAL GERAL',
      '',
      grandTotals.members_present,
      grandTotals.leaders_in_training,
      grandTotals.discipleships,
      grandTotals.visitors,
      grandTotals.children,
      grandTotal
    ]);

    const csvContent = [
      `Relatório da Rede - Semana ${formatWeekDisplay()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_rede_${weekStart}.csv`;
    link.click();
    
    toast({
      title: 'Sucesso!',
      description: 'Arquivo CSV exportado com sucesso',
    });
  };

  const statCards = [
    { icon: Users, label: 'Total Membros', value: grandTotals.members_present },
    { icon: UserCheck, label: 'Líderes em Treinamento', value: grandTotals.leaders_in_training },
    { icon: Heart, label: 'Discipulados', value: grandTotals.discipleships },
    { icon: UserPlus, label: 'Visitantes', value: grandTotals.visitors },
    { icon: Baby, label: 'Crianças', value: grandTotals.children },
  ];

  if (redesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard do Líder de Rede</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WeekSelector selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
          {selectedRede && currentWeekReports.length > 0 && (
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecione sua Rede</CardTitle>
          <CardDescription>Visualize os dados consolidados de todas as coordenações</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRede} onValueChange={setSelectedRede}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Selecione uma rede" />
            </SelectTrigger>
            <SelectContent>
              {userRedes.map(rede => (
                <SelectItem key={rede.id} value={rede.id}>
                  {rede.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRede && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {statCards.map(({ icon: Icon, label, value }) => (
              <Card key={label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coordenações Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Dados por Coordenação
              </CardTitle>
              <CardDescription>
                {Object.keys(reportsByCoordenacao).length} coordenação(ões) com relatórios nesta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : Object.keys(reportsByCoordenacao).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coordenação</TableHead>
                      <TableHead className="text-center">Células</TableHead>
                      <TableHead className="text-center">Membros</TableHead>
                      <TableHead className="text-center">Líderes Trein.</TableHead>
                      <TableHead className="text-center">Discipulados</TableHead>
                      <TableHead className="text-center">Visitantes</TableHead>
                      <TableHead className="text-center">Crianças</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(reportsByCoordenacao).map(([coordId, coord]) => {
                      const total = coord.totals.members_present + coord.totals.leaders_in_training + 
                        coord.totals.discipleships + coord.totals.visitors + coord.totals.children;
                      return (
                        <TableRow key={coordId}>
                          <TableCell className="font-medium">{coord.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{coord.reports.length}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{coord.totals.members_present}</TableCell>
                          <TableCell className="text-center">{coord.totals.leaders_in_training}</TableCell>
                          <TableCell className="text-center">{coord.totals.discipleships}</TableCell>
                          <TableCell className="text-center">{coord.totals.visitors}</TableCell>
                          <TableCell className="text-center">{coord.totals.children}</TableCell>
                          <TableCell className="text-center">
                            <Badge>{total}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Grand Total Row */}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>TOTAL GERAL</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{currentWeekReports.length}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{grandTotals.members_present}</TableCell>
                      <TableCell className="text-center">{grandTotals.leaders_in_training}</TableCell>
                      <TableCell className="text-center">{grandTotals.discipleships}</TableCell>
                      <TableCell className="text-center">{grandTotals.visitors}</TableCell>
                      <TableCell className="text-center">{grandTotals.children}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">
                          {grandTotals.members_present + grandTotals.leaders_in_training + 
                            grandTotals.discipleships + grandTotals.visitors + grandTotals.children}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum relatório enviado nesta semana
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedRede && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Network className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecione uma rede</h3>
            <p className="text-muted-foreground mt-1">
              Escolha sua rede acima para visualizar os dados consolidados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
