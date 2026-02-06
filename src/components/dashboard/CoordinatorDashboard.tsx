import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Heart, UserPlus, Baby, Loader2, LayoutGrid } from 'lucide-react';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useWeeklyReportsByCoordenacao, getCurrentWeekStart } from '@/hooks/useWeeklyReports';
import { useAuth } from '@/contexts/AuthContext';

export function CoordinatorDashboard() {
  const { profile } = useAuth();
  const { data: coordenacoes, isLoading: coordenacoesLoading } = useCoordenacoes();
  
  const [selectedCoordenacao, setSelectedCoordenacao] = useState<string>('');
  const { data: reports, isLoading: reportsLoading } = useWeeklyReportsByCoordenacao(selectedCoordenacao);
  
  const weekStart = getCurrentWeekStart();

  // Filter coordenacoes where user is leader
  const userCoordenacoes = coordenacoes?.filter(c => c.leader?.id === profile?.id) || coordenacoes || [];

  // Filter reports for current week
  const currentWeekReports = reports?.filter(r => r.week_start === weekStart) || [];

  // Calculate totals
  const totals = currentWeekReports.reduce((acc, report) => ({
    members_present: acc.members_present + report.members_present,
    leaders_in_training: acc.leaders_in_training + report.leaders_in_training,
    discipleships: acc.discipleships + report.discipleships,
    visitors: acc.visitors + report.visitors,
    children: acc.children + report.children,
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

  const statCards = [
    { icon: Users, label: 'Total Membros', value: totals.members_present },
    { icon: UserCheck, label: 'Líderes em Treinamento', value: totals.leaders_in_training },
    { icon: Heart, label: 'Discipulados', value: totals.discipleships },
    { icon: UserPlus, label: 'Visitantes', value: totals.visitors },
    { icon: Baby, label: 'Crianças', value: totals.children },
  ];

  if (coordenacoesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard do Coordenador</h2>
          <p className="text-muted-foreground">Semana: {formatWeekDisplay(weekStart)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecione sua Coordenação</CardTitle>
          <CardDescription>Visualize os dados das células da sua coordenação</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCoordenacao} onValueChange={setSelectedCoordenacao}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Selecione uma coordenação" />
            </SelectTrigger>
            <SelectContent>
              {userCoordenacoes.map(coord => (
                <SelectItem key={coord.id} value={coord.id}>
                  {coord.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCoordenacao && (
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

          {/* Cells Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Relatórios por Célula
              </CardTitle>
              <CardDescription>
                {currentWeekReports.length} célula(s) enviaram relatório esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : currentWeekReports.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Célula</TableHead>
                      <TableHead className="text-center">Membros</TableHead>
                      <TableHead className="text-center">Líderes Trein.</TableHead>
                      <TableHead className="text-center">Discipulados</TableHead>
                      <TableHead className="text-center">Visitantes</TableHead>
                      <TableHead className="text-center">Crianças</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentWeekReports.map(report => {
                      const total = report.members_present + report.leaders_in_training + 
                        report.discipleships + report.visitors + report.children;
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.celula?.name}</TableCell>
                          <TableCell className="text-center">{report.members_present}</TableCell>
                          <TableCell className="text-center">{report.leaders_in_training}</TableCell>
                          <TableCell className="text-center">{report.discipleships}</TableCell>
                          <TableCell className="text-center">{report.visitors}</TableCell>
                          <TableCell className="text-center">{report.children}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{total}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum relatório enviado esta semana
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCoordenacao && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecione uma coordenação</h3>
            <p className="text-muted-foreground mt-1">
              Escolha sua coordenação acima para visualizar os dados das células
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
