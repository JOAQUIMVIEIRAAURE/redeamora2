import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Heart, UserPlus, Baby, Loader2, LayoutGrid, Eye, ClipboardCheck, Image, FileSpreadsheet, Sparkles, History, User } from 'lucide-react';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useCelulas } from '@/hooks/useCelulas';
import { useWeeklyReportsByCoordenacao, useUpdateWeeklyReport, useDeleteWeeklyReport } from '@/hooks/useWeeklyReports';
import { useSupervisoesByCoordenacao } from '@/hooks/useSupervisoes';
import { useToast } from '@/hooks/use-toast';
import { DateRangeSelector, DateRangeValue, getDateString } from './DateRangeSelector';
import { CelulaDetailsDialog } from './CelulaDetailsDialog';
import { SupervisoesList } from './SupervisoesList';
import { LeaderBirthdayAlert } from './LeaderBirthdayAlert';
import { CelulaPhotoGallery } from './CelulaPhotoGallery';
import { AIInsightsPanel } from './AIInsightsPanel';
import { ReportsHistoryTable } from '@/components/reports/ReportsHistoryTable';
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
  
  const updateReport = useUpdateWeeklyReport();
  const deleteReport = useDeleteWeeklyReport();

  const handleEditReport = (data: {
    id: string;
    members_present: number;
    leaders_in_training: number;
    discipleships: number;
    visitors: number;
    children: number;
    notes: string | null;
  }) => {
    updateReport.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Sucesso!',
          description: 'Relatório atualizado com sucesso',
        });
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o relatório',
          variant: 'destructive',
        });
      },
    });
  };

  const handleDeleteReport = (id: string) => {
    deleteReport.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Sucesso!',
          description: 'Relatório excluído com sucesso',
        });
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o relatório',
          variant: 'destructive',
        });
      },
    });
  };

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
  
  const selectedCoordData = userCoordenacoes.find(c => c.id === selectedCoordenacao);

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
              {userCoordenacoes.map((coord) => (
                <SelectItem key={coord.id} value={coord.id}>
                  {coord.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCoordData?.leadership_couple && (
        <Card>
          <CardHeader>
            <CardTitle>Liderança da Coordenação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {selectedCoordData.leadership_couple.spouse1 && (
                  <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage src={selectedCoordData.leadership_couple.spouse1.avatar_url || undefined} />
                    <AvatarFallback>{selectedCoordData.leadership_couple.spouse1.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                {selectedCoordData.leadership_couple.spouse2 && (
                  <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage src={selectedCoordData.leadership_couple.spouse2.avatar_url || undefined} />
                    <AvatarFallback>{selectedCoordData.leadership_couple.spouse2.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div>
                <p className="font-medium text-lg">
                  {selectedCoordData.leadership_couple.spouse1?.name} & {selectedCoordData.leadership_couple.spouse2?.name}
                </p>
                <p className="text-muted-foreground">Coordenadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="relatorios" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Insights IA
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

            <TabsContent value="insights">
              <AIInsightsPanel 
                reports={currentReports} 
                periodLabel={formatDateRangeDisplay()}
                context="coordenacao"
              />
            </TabsContent>

            <TabsContent value="relatorios">
              {/* Cells Table */}
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Célula</TableHead>
                      <TableHead className="text-center">Membros</TableHead>
                      <TableHead className="text-center">Líderes Trein.</TableHead>
                      <TableHead className="text-center">Discipulados</TableHead>
                      <TableHead className="text-center">Visitantes</TableHead>
                      <TableHead className="text-center">Crianças</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {celulas?.filter(c => c.coordenacao_id === selectedCoordenacao).map((celula) => {
                      // Filter reports for this cell
                      const cellReports = currentReports.filter(r => r.celula_id === celula.id);
                      
                      // Calculate cell totals
                      const cellTotals = cellReports.reduce((acc, r) => ({
                        members_present: acc.members_present + r.members_present,
                        leaders_in_training: acc.leaders_in_training + r.leaders_in_training,
                        discipleships: acc.discipleships + r.discipleships,
                        visitors: acc.visitors + r.visitors,
                        children: acc.children + r.children,
                      }), {
                        members_present: 0,
                        leaders_in_training: 0,
                        discipleships: 0,
                        visitors: 0,
                        children: 0,
                      });

                      return (
                        <TableRow key={celula.id}>
                          <TableCell className="font-medium">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium"
                              onClick={() => setSelectedCelula({ id: celula.id, name: celula.name })}
                            >
                              {celula.name}
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">{cellTotals.members_present}</TableCell>
                          <TableCell className="text-center">{cellTotals.leaders_in_training}</TableCell>
                          <TableCell className="text-center">{cellTotals.discipleships}</TableCell>
                          <TableCell className="text-center">{cellTotals.visitors}</TableCell>
                          <TableCell className="text-center">{cellTotals.children}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedCelula({ id: celula.id, name: celula.name })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="historico">
              <ReportsHistoryTable 
                reports={currentReports}
                onEdit={handleEditReport}
                onDelete={handleDeleteReport}
              />
            </TabsContent>

            <TabsContent value="fotos">
              <CelulaPhotoGallery reports={currentReports} />
            </TabsContent>

            <TabsContent value="supervisoes">
              <SupervisoesList supervisoes={supervisoes || []} />
            </TabsContent>
          </Tabs>
        </>
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
