import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Heart, UserPlus, Baby, Loader2, Network, Download, ChevronDown, ChevronUp, Eye, ClipboardCheck, Image } from 'lucide-react';
import { useRedes } from '@/hooks/useRedes';
import { useWeeklyReportsByRede, WeeklyReport } from '@/hooks/useWeeklyReports';
import { useSupervisoesByRede } from '@/hooks/useSupervisoes';
import { useToast } from '@/hooks/use-toast';
import { DateRangeSelector, DateRangeValue, getDateString } from './DateRangeSelector';
import { CelulaDetailsDialog } from './CelulaDetailsDialog';
import { SupervisoesList } from './SupervisoesList';
import { LeaderBirthdayAlert } from './LeaderBirthdayAlert';
import { CelulaPhotoGallery } from './CelulaPhotoGallery';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NetworkLeaderDashboard() {
  const { toast } = useToast();
  const { data: redes, isLoading: redesLoading } = useRedes();
  
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

  const exportToCSV = () => {
    if (!currentReports.length) {
      toast({
        title: 'Aviso',
        description: 'Nenhum dado para exportar',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Coordenação', 'Célula', 'Data', 'Membros Presentes', 'Líderes em Treinamento', 'Discipulados', 'Visitantes', 'Crianças', 'Total'];
    
    const rows = currentReports.map(report => {
      const total = report.members_present + report.leaders_in_training + 
        report.discipleships + report.visitors + report.children;
      const reportDate = report.meeting_date || report.week_start;
      return [
        report.celula?.coordenacao?.name || '',
        report.celula?.name || '',
        format(new Date(reportDate), "dd/MM/yyyy", { locale: ptBR }),
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
      '',
      grandTotals.members_present,
      grandTotals.leaders_in_training,
      grandTotals.discipleships,
      grandTotals.visitors,
      grandTotals.children,
      grandTotal
    ]);

    const csvContent = [
      `Relatório da Rede - Período ${formatDateRangeDisplay()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_rede_${dateRangeFilter.from}_${dateRangeFilter.to}.csv`;
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

          <Tabs defaultValue="coordenacoes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="coordenacoes" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Coordenações
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

            <TabsContent value="coordenacoes">
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
                    <div className="space-y-4">
                      {Object.entries(reportsByCoordenacao).map(([coordId, coord]) => {
                        const total = coord.totals.members_present + coord.totals.leaders_in_training + 
                          coord.totals.discipleships + coord.totals.visitors + coord.totals.children;
                        const isExpanded = expandedCoords.has(coordId);
                        
                        return (
                          <Collapsible key={coordId} open={isExpanded} onOpenChange={() => toggleCoord(coordId)}>
                            <Card>
                              <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="text-base">{coord.name}</CardTitle>
                                      <CardDescription>
                                        {coord.reports.length} célula(s) • Total: {total}
                                      </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Membros: {coord.totals.members_present}</span>
                                        <span>•</span>
                                        <span>Visitantes: {coord.totals.visitors}</span>
                                      </div>
                                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="pt-0">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Célula</TableHead>
                                        <TableHead className="text-center">Membros</TableHead>
                                        <TableHead className="text-center">Líderes</TableHead>
                                        <TableHead className="text-center">Disc.</TableHead>
                                        <TableHead className="text-center">Vis.</TableHead>
                                        <TableHead className="text-center">Crianças</TableHead>
                                        <TableHead className="text-center">Ações</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {coord.reports.map(report => (
                                        <TableRow key={report.id}>
                                          <TableCell className="font-medium">{report.celula?.name}</TableCell>
                                          <TableCell className="text-center">{report.members_present}</TableCell>
                                          <TableCell className="text-center">{report.leaders_in_training}</TableCell>
                                          <TableCell className="text-center">{report.discipleships}</TableCell>
                                          <TableCell className="text-center">{report.visitors}</TableCell>
                                          <TableCell className="text-center">{report.children}</TableCell>
                                          <TableCell className="text-center">
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCelula({ 
                                                  id: report.celula_id, 
                                                  name: report.celula?.name || '' 
                                                });
                                              }}
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        );
                      })}

                      {/* Grand Total Card */}
                      <Card className="bg-muted/50">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">TOTAL GERAL</p>
                              <p className="text-sm text-muted-foreground">
                                {currentReports.length} célula(s) com relatório
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <p className="font-bold">{grandTotals.members_present}</p>
                                <p className="text-muted-foreground">Membros</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold">{grandTotals.leaders_in_training}</p>
                                <p className="text-muted-foreground">Líderes</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold">{grandTotals.discipleships}</p>
                                <p className="text-muted-foreground">Disc.</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold">{grandTotals.visitors}</p>
                                <p className="text-muted-foreground">Vis.</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold">{grandTotals.children}</p>
                                <p className="text-muted-foreground">Crianças</p>
                              </div>
                              <Badge variant="default" className="text-lg">
                                {grandTotals.members_present + grandTotals.leaders_in_training + 
                                  grandTotals.discipleships + grandTotals.visitors + grandTotals.children}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum relatório enviado nesta semana
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
                    Fotos enviadas pelos líderes de célula da rede
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CelulaPhotoGallery 
                    reports={redeData?.reports || []} 
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
                  title="Supervisões da Rede"
                  showCoordenacao
                />
              </TabsContent>
            )}
          </Tabs>
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
