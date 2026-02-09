import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Heart, UserPlus, Baby, Loader2, Network, FileSpreadsheet, ChevronDown, ChevronUp, Eye, ClipboardCheck, Image, Sparkles, History, GitBranch, User } from 'lucide-react';
import { useRedes } from '@/hooks/useRedes';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useCelulas } from '@/hooks/useCelulas';
import { useWeeklyReportsByRede, WeeklyReport, useUpdateWeeklyReport, useDeleteWeeklyReport } from '@/hooks/useWeeklyReports';
import { useSupervisoesByRede } from '@/hooks/useSupervisoes';
import { useToast } from '@/hooks/use-toast';
import { DateRangeSelector, DateRangeValue, getDateString } from './DateRangeSelector';
import { CelulaDetailsDialog } from './CelulaDetailsDialog';
import { SupervisoesList } from './SupervisoesList';
import { LeaderBirthdayAlert } from './LeaderBirthdayAlert';
import { CelulaPhotoGallery } from './CelulaPhotoGallery';
import { AIInsightsPanel } from './AIInsightsPanel';
import { MultiplicacoesTab } from './MultiplicacoesTab';
import { ReportsHistoryTable } from '@/components/reports/ReportsHistoryTable';
import { exportToExcel } from '@/utils/exportReports';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NetworkLeaderDashboard() {
  const { toast } = useToast();
  const { data: redes, isLoading: redesLoading } = useRedes();
  const { data: coordenacoes } = useCoordenacoes();
  const { data: celulas } = useCelulas();
  
  const [selectedRede, setSelectedRede] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: subDays(new Date(), 6),
    to: new Date()
  });
  const [expandedCoords, setExpandedCoords] = useState<Set<string>>(new Set());
  const [selectedCelula, setSelectedCelula] = useState<{ id: string; name: string } | null>(null);
  
  const dateRangeFilter = {
    from: getDateString(dateRange.from),
    to: getDateString(dateRange.to)
  };
  
  const { data: redeData, isLoading: reportsLoading } = useWeeklyReportsByRede(selectedRede, dateRangeFilter);
  const { data: supervisoes } = useSupervisoesByRede(selectedRede);
  
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

  const toggleCoord = (coordId: string) => {
    setExpandedCoords(prev => {
      const next = new Set(prev);
      if (next.has(coordId)) {
        next.delete(coordId);
      } else {
        next.add(coordId);
      }
      return next;
    });
  };

  // Show all redes in controlled environment
  const userRedes = redes || [];
  
  const selectedRedeData = userRedes.find(r => r.id === selectedRede);

  // Use all reports in the date range
  const currentReports = redeData?.reports || [];

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
  const reportsByCoordenacao = currentReports.reduce<Record<string, CoordenacaoData>>((acc, report) => {
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

  const formatDateRangeDisplay = () => {
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  const handleExportExcel = () => {
    if (!currentReports.length || !celulas || !coordenacoes) {
      toast({
        title: 'Aviso',
        description: 'Nenhum dado para exportar',
        variant: 'destructive',
      });
      return;
    }

    // Filter coordenacoes for this rede only
    const redeCoord = coordenacoes.filter(c => c.rede_id === selectedRede);
    const redeCelulas = celulas.filter(c => redeCoord.some(coord => coord.id === c.coordenacao_id));

    exportToExcel({
      reports: currentReports,
      celulas: redeCelulas,
      coordenacoes: redeCoord,
      periodLabel: formatDateRangeDisplay(),
    });
    
    toast({
      title: 'Sucesso!',
      description: 'Arquivo Excel exportado com sucesso',
    });
  };

  const statCards = [
    { icon: Users, label: 'Total Membros', value: grandTotals.members_present },
    { icon: UserCheck, label: 'Líderes em Treinamento', value: grandTotals.leaders_in_training },
    { icon: Heart, label: 'Discipulados', value: grandTotals.discipleships },
    { icon: UserPlus, label: 'Visitantes', value: grandTotals.visitors },
    { icon: Baby, label: 'Crianças', value: grandTotals.children },
    { icon: ClipboardCheck, label: 'Supervisões', value: supervisoes?.length || 0 },
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
          <p className="text-sm text-muted-foreground">
            Período: {formatDateRangeDisplay()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
          {selectedRede && currentReports.length > 0 && (
            <Button onClick={handleExportExcel} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
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
              {userRedes.map((rede) => (
                <SelectItem key={rede.id} value={rede.id}>
                  {rede.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRedeData?.leadership_couple && (
        <Card>
          <CardHeader>
            <CardTitle>Liderança da Rede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {selectedRedeData.leadership_couple.spouse1 && (
                  <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage src={selectedRedeData.leadership_couple.spouse1.avatar_url || undefined} />
                    <AvatarFallback>{selectedRedeData.leadership_couple.spouse1.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                {selectedRedeData.leadership_couple.spouse2 && (
                  <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage src={selectedRedeData.leadership_couple.spouse2.avatar_url || undefined} />
                    <AvatarFallback>{selectedRedeData.leadership_couple.spouse2.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div>
                <p className="font-medium text-lg">
                  {selectedRedeData.leadership_couple.spouse1?.name} & {selectedRedeData.leadership_couple.spouse2?.name}
                </p>
                <p className="text-muted-foreground">Líderes de Rede</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedRede && (
        <>
          {/* Birthday Alert for Cell Leaders */}
          <LeaderBirthdayAlert redeId={selectedRede} />

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

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Insights IA
              </TabsTrigger>
              <TabsTrigger value="multiplicacao" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Multiplicação
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
                context="rede"
              />
            </TabsContent>

            <TabsContent value="multiplicacao">
              <MultiplicacoesTab />
            </TabsContent>

            <TabsContent value="overview">
              <div className="space-y-4">
                {Object.values(reportsByCoordenacao).map((coordData) => (
                  <Card key={coordData.name}>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleCoord(coordData.name)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>{coordData.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {coordData.reports.length} células com relatório
                              </CardDescription>
                            </div>
                            {expandedCoords.has(coordData.name) ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
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
                              {coordData.reports.map((report) => (
                                <TableRow key={report.id}>
                                  <TableCell className="font-medium">
                                    <Button 
                                      variant="link" 
                                      className="p-0 h-auto font-medium"
                                      onClick={() => setSelectedCelula({ id: report.celula_id, name: report.celula?.name || 'Célula' })}
                                    >
                                      {report.celula?.name}
                                    </Button>
                                  </TableCell>
                                  <TableCell className="text-center">{report.members_present}</TableCell>
                                  <TableCell className="text-center">{report.leaders_in_training}</TableCell>
                                  <TableCell className="text-center">{report.discipleships}</TableCell>
                                  <TableCell className="text-center">{report.visitors}</TableCell>
                                  <TableCell className="text-center">{report.children}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setSelectedCelula({ id: report.celula_id, name: report.celula?.name || 'Célula' })}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {/* Subtotal row */}
                              <TableRow className="bg-muted/50 font-medium">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-center">{coordData.totals.members_present}</TableCell>
                                <TableCell className="text-center">{coordData.totals.leaders_in_training}</TableCell>
                                <TableCell className="text-center">{coordData.totals.discipleships}</TableCell>
                                <TableCell className="text-center">{coordData.totals.visitors}</TableCell>
                                <TableCell className="text-center">{coordData.totals.children}</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
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
              <CelulaPhotoGallery redeId={selectedRede} />
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
          
