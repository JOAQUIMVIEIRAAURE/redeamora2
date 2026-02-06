import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Heart, UserPlus, Baby, Loader2, Network, Download, LayoutGrid, Home } from 'lucide-react';
import { useRedes } from '@/hooks/useRedes';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useCelulas } from '@/hooks/useCelulas';
import { useWeeklyReports, getCurrentWeekStart, WeeklyReport } from '@/hooks/useWeeklyReports';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const { toast } = useToast();
  const { data: redes, isLoading: redesLoading } = useRedes();
  const { data: coordenacoes, isLoading: coordenacoesLoading } = useCoordenacoes();
  const { data: celulas, isLoading: celulasLoading } = useCelulas();
  const { data: allReports, isLoading: reportsLoading } = useWeeklyReports();
  
  const weekStart = getCurrentWeekStart();
  const isLoading = redesLoading || coordenacoesLoading || celulasLoading || reportsLoading;

  // Filter reports for current week
  const currentWeekReports = allReports?.filter(r => r.week_start === weekStart) || [];

  // Define type for rede data
  interface RedeData {
    name: string;
    coordenacoes: string[];
    totals: {
      members_present: number;
      leaders_in_training: number;
      discipleships: number;
      visitors: number;
      children: number;
    };
    cellCount: number;
  }

  // Group reports by rede
  const reportsByRede = currentWeekReports.reduce<Record<string, RedeData>>((acc, report) => {
    const redeId = report.celula?.coordenacao?.rede?.id;
    const redeName = report.celula?.coordenacao?.rede?.name || 'Sem Rede';
    const coordId = report.celula?.coordenacao_id;
    if (!redeId) return acc;
    
    if (!acc[redeId]) {
      acc[redeId] = {
        name: redeName,
        coordenacoes: [],
        totals: {
          members_present: 0,
          leaders_in_training: 0,
          discipleships: 0,
          visitors: 0,
          children: 0,
        },
        cellCount: 0,
      };
    }
    
    if (coordId && !acc[redeId].coordenacoes.includes(coordId)) {
      acc[redeId].coordenacoes.push(coordId);
    }
    
    acc[redeId].cellCount++;
    acc[redeId].totals.members_present += report.members_present;
    acc[redeId].totals.leaders_in_training += report.leaders_in_training;
    acc[redeId].totals.discipleships += report.discipleships;
    acc[redeId].totals.visitors += report.visitors;
    acc[redeId].totals.children += report.children;
    
    return acc;
  }, {});

  // Calculate grand totals
  const grandTotals = Object.values(reportsByRede).reduce((acc, rede) => ({
    members_present: acc.members_present + rede.totals.members_present,
    leaders_in_training: acc.leaders_in_training + rede.totals.leaders_in_training,
    discipleships: acc.discipleships + rede.totals.discipleships,
    visitors: acc.visitors + rede.totals.visitors,
    children: acc.children + rede.totals.children,
  }), {
    members_present: 0,
    leaders_in_training: 0,
    discipleships: 0,
    visitors: 0,
    children: 0,
  });

  const formatWeekDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    return `${date.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
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

    const headers = ['Rede', 'Coordenação', 'Célula', 'Membros Presentes', 'Líderes em Treinamento', 'Discipulados', 'Visitantes', 'Crianças', 'Total'];
    
    const rows = currentWeekReports.map(report => {
      const total = report.members_present + report.leaders_in_training + 
        report.discipleships + report.visitors + report.children;
      return [
        report.celula?.coordenacao?.rede?.name || '',
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

    // Add grand total
    const grandTotal = grandTotals.members_present + grandTotals.leaders_in_training + 
      grandTotals.discipleships + grandTotals.visitors + grandTotals.children;
    rows.push([
      'TOTAL GERAL',
      '',
      '',
      grandTotals.members_present,
      grandTotals.leaders_in_training,
      grandTotals.discipleships,
      grandTotals.visitors,
      grandTotals.children,
      grandTotal
    ]);

    const csvContent = [
      `Relatório Geral - Semana ${formatWeekDisplay(weekStart)}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_geral_${weekStart}.csv`;
    link.click();
    
    toast({
      title: 'Sucesso!',
      description: 'Arquivo CSV exportado com sucesso',
    });
  };

  const statCards = [
    { icon: Network, label: 'Total Redes', value: redes?.length || 0 },
    { icon: LayoutGrid, label: 'Total Coordenações', value: coordenacoes?.length || 0 },
    { icon: Home, label: 'Total Células', value: celulas?.length || 0 },
    { icon: Users, label: 'Membros (semana)', value: grandTotals.members_present },
    { icon: UserPlus, label: 'Visitantes (semana)', value: grandTotals.visitors },
  ];

  const detailCards = [
    { icon: UserCheck, label: 'Líderes em Treinamento', value: grandTotals.leaders_in_training },
    { icon: Heart, label: 'Discipulados', value: grandTotals.discipleships },
    { icon: Baby, label: 'Crianças', value: grandTotals.children },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h2>
          <p className="text-muted-foreground">Semana: {formatWeekDisplay(weekStart)}</p>
        </div>
        {currentWeekReports.length > 0 && (
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar para CSV
          </Button>
        )}
      </div>

      {/* Main Stats Cards */}
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

      {/* Detail Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {detailCards.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports by Rede Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Dados por Rede
          </CardTitle>
          <CardDescription>
            {Object.keys(reportsByRede).length} rede(s) com relatórios esta semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(reportsByRede).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rede</TableHead>
                  <TableHead className="text-center">Coord.</TableHead>
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
                {Object.entries(reportsByRede).map(([redeId, rede]) => {
                  const total = rede.totals.members_present + rede.totals.leaders_in_training + 
                    rede.totals.discipleships + rede.totals.visitors + rede.totals.children;
                  return (
                    <TableRow key={redeId}>
                      <TableCell className="font-medium">{rede.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{rede.coordenacoes.length}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{rede.cellCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{rede.totals.members_present}</TableCell>
                      <TableCell className="text-center">{rede.totals.leaders_in_training}</TableCell>
                      <TableCell className="text-center">{rede.totals.discipleships}</TableCell>
                      <TableCell className="text-center">{rede.totals.visitors}</TableCell>
                      <TableCell className="text-center">{rede.totals.children}</TableCell>
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
                    <Badge variant="outline">{coordenacoes?.length || 0}</Badge>
                  </TableCell>
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
              Nenhum relatório enviado esta semana
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
