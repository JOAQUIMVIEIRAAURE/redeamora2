import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Heart, UserPlus, Baby, Loader2, LayoutGrid, Eye, ClipboardCheck, Image, FileSpreadsheet } from 'lucide-react';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useCelulas } from '@/hooks/useCelulas';
import { useWeeklyReportsByCoordenacao } from '@/hooks/useWeeklyReports';
import { useSupervisoesByCoordenacao } from '@/hooks/useSupervisoes';
import { useToast } from '@/hooks/use-toast';
import { DateRangeSelector, DateRangeValue, getDateString } from './DateRangeSelector';
import { CelulaDetailsDialog } from './CelulaDetailsDialog';
import { SupervisoesList } from './SupervisoesList';
import { LeaderBirthdayAlert } from './LeaderBirthdayAlert';
import { CelulaPhotoGallery } from './CelulaPhotoGallery';
import { exportToExcel } from '@/utils/exportReports';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CoordinatorDashboard() {
  const { toast } = useToast();
  const { data: coordenacoes, isLoading: coordenacoesLoading } = useCoordenacoes();
  const { data: celulas } = useCelulas();
  
  const [selectedCoordenacao, setSelectedCoordenacao] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: subDays(new Date(), 6),
    to: new Date()
  });
  const [selectedCelula, setSelectedCelula] = useState<{ id: string; name: string } | null>(null);
  
  const dateRangeFilter = {
    from: getDateString(dateRange.from),
    to: getDateString(dateRange.to)
  };
  
  const { data: reports, isLoading: reportsLoading } = useWeeklyReportsByCoordenacao(selectedCoordenacao, dateRangeFilter);
  const { data: supervisoes, isLoading: supervisoesLoading } = useSupervisoesByCoordenacao(selectedCoordenacao);

  const formatDateRangeDisplay = () => {
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  const handleExportExcel = () => {
    if (!reports?.length || !celulas || !coordenacoes) {
      toast({
        title: 'Aviso',
        description: 'Nenhum dado para exportar',
        variant: 'destructive',
      });
      return;
    }

    // Filter data for this coordenacao only
    const coord = coordenacoes.filter(c => c.id === selectedCoordenacao);
    const coordCelulas = celulas.filter(c => c.coordenacao_id === selectedCoordenacao);

    exportToExcel({
      reports: reports,
      celulas: coordCelulas,
      coordenacoes: coord,
      periodLabel: formatDateRangeDisplay(),
    });
    
    toast({
      title: 'Sucesso!',
      description: 'Arquivo Excel exportado com sucesso',
    });
  };

  // Show all coordenacoes in controlled environment
  const userCoordenacoes = coordenacoes || [];

  // Use all reports in the date range (no week filtering needed)
  const currentReports = reports || [];

  // Calculate totals
  const totals = currentReports.reduce((acc, report) => ({
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

  // Stats for supervisoes
  const supervisoesStats = {
    total: supervisoes?.length || 0,
    realizadas: supervisoes?.filter(s => s.celula_realizada).length || 0,
  };

  const statCards = [
    { icon: Users, label: 'Total Membros', value: totals.members_present },
    { icon: UserCheck, label: 'Líderes em Treinamento', value: totals.leaders_in_training },
    { icon: Heart, label: 'Discipulados', value: totals.discipleships },
    { icon: UserPlus, label: 'Visitantes', value: totals.visitors },
    { icon: Baby, label: 'Crianças', value: totals.children },
    { icon: ClipboardCheck, label: 'Supervisões', value: supervisoesStats.total },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard do Coordenador</h2>
          <p className="text-sm text-muted-foreground">
            Período: {formatDateRangeDisplay()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
          {selectedCoordenacao && currentReports.length > 0 && (
            <Button onClick={handleExportExcel} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          )}
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
          {/* Birthday Alert for Cell Leaders */}
          <LeaderBirthdayAlert coordenacaoId={selectedCoordenacao} />

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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

          <Tabs defaultValue="relatorios" className="space-y-4">
            <TabsList>
              <TabsTrigger value="relatorios" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="fotos" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Galeria de Fotos
              </TabsTrigger>
              {supervisoes && supervisoes.length > 0 && (
                <TabsTrigger value="supervisoes" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Supervisões
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="relatorios">
              {/* Cells Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5" />
                    Relatórios por Célula
                  </CardTitle>
                  <CardDescription>
                    {currentReports.length} célula(s) enviaram relatório no período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : currentReports.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Célula</TableHead>
                          <TableHead className="text-center">Data</TableHead>
                          <TableHead className="text-center">Membros</TableHead>
                          <TableHead className="text-center">Líderes Trein.</TableHead>
                          <TableHead className="text-center">Discipulados</TableHead>
                          <TableHead className="text-center">Visitantes</TableHead>
                          <TableHead className="text-center">Crianças</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentReports.map(report => {
                          const total = report.members_present + report.leaders_in_training + 
                            report.discipleships + report.visitors + report.children;
                          const reportDate = report.meeting_date || report.week_start;
                          return (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.celula?.name}</TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">
                                {format(new Date(reportDate), "dd/MM/yyyy", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="text-center">{report.members_present}</TableCell>
                              <TableCell className="text-center">{report.leaders_in_training}</TableCell>
                              <TableCell className="text-center">{report.discipleships}</TableCell>
                              <TableCell className="text-center">{report.visitors}</TableCell>
                              <TableCell className="text-center">{report.children}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary">{total}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedCelula({ 
                                    id: report.celula_id, 
                                    name: report.celula?.name || '' 
                                  })}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum relatório enviado no período
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fotos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Galeria de Fotos das Células
                  </CardTitle>
                  <CardDescription>
                    Fotos enviadas pelos líderes de célula
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CelulaPhotoGallery 
                    reports={reports || []} 
                    isLoading={reportsLoading}
                    showCelulaFilter={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {supervisoes && supervisoes.length > 0 && (
              <TabsContent value="supervisoes">
                <SupervisoesList 
                  supervisoes={supervisoes} 
                  title="Supervisões da Coordenação"
                />
              </TabsContent>
            )}
          </Tabs>
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

      {selectedCelula && (
        <CelulaDetailsDialog
          open={!!selectedCelula}
          onOpenChange={(open) => !open && setSelectedCelula(null)}
          celulaId={selectedCelula.id}
          celulaName={selectedCelula.name}
        />
      )}
    </div>
  );
}
