import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Network, FolderTree, Home, Users, UserPlus, FileText,
  GitBranch, Trophy, Loader2, FileSpreadsheet, Database
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DateRangeSelector, DateRangeValue, getDateString } from '@/components/dashboard/DateRangeSelector';
import { useRedes } from '@/hooks/useRedes';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useCelulas } from '@/hooks/useCelulas';
import { useMembers } from '@/hooks/useMembers';
import { useWeeklyReports, DateRangeFilter } from '@/hooks/useWeeklyReports';
import { useMultiplicacoes } from '@/hooks/useMultiplicacoes';
import { useDadosAggregations } from '@/hooks/useDadosReports';
import { useMemberRanking, RankedMember } from '@/hooks/useMemberRanking';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const milestoneLabels: Record<string, string> = {
  batismo: 'Batismo',
  encontro_com_deus: 'Encontro',
  renovo: 'Renovo',
  encontro_de_casais: 'Casais',
  curso_lidere: 'Lidere',
  is_discipulado: 'Discipulado',
  is_lider_em_treinamento: 'Líder Trein.',
};

export default function Dados() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [filterRede, setFilterRede] = useState<string>('all');
  const [filterCoord, setFilterCoord] = useState<string>('all');

  const dateRangeFilter: DateRangeFilter = {
    from: getDateString(dateRange.from),
    to: getDateString(dateRange.to),
  };

  const { data: redes, isLoading: l1 } = useRedes();
  const { data: coordenacoes, isLoading: l2 } = useCoordenacoes();
  const { data: celulas, isLoading: l3 } = useCelulas();
  const { data: members, isLoading: l4 } = useMembers();
  const { data: reports, isLoading: l5 } = useWeeklyReports(undefined, dateRangeFilter);
  const { data: multiplicacoes } = useMultiplicacoes();

  const isLoading = l1 || l2 || l3 || l4 || l5;

  // Filter coordenacoes by rede
  const filteredCoords = useMemo(() => {
    if (!coordenacoes) return [];
    if (filterRede === 'all') return coordenacoes;
    return coordenacoes.filter(c => c.rede_id === filterRede);
  }, [coordenacoes, filterRede]);

  // Filter celulas by coord (and rede)
  const filteredCelulas = useMemo(() => {
    if (!celulas) return [];
    const validCoordIds = filteredCoords.map(c => c.id);
    let result = celulas.filter(c => validCoordIds.includes(c.coordenacao_id));
    if (filterCoord !== 'all') {
      result = result.filter(c => c.coordenacao_id === filterCoord);
    }
    return result;
  }, [celulas, filteredCoords, filterCoord]);

  // Filter reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    const validCelulaIds = new Set(filteredCelulas.map(c => c.id));
    return reports.filter(r => validCelulaIds.has(r.celula_id));
  }, [reports, filteredCelulas]);

  // Filter members
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    const validCelulaIds = new Set(filteredCelulas.map(c => c.id));
    return members.filter(m => validCelulaIds.has(m.celula_id));
  }, [members, filteredCelulas]);

  const { byRede, byCoordenacao, byCelula, byLider, kpis } = useDadosAggregations(
    filterRede === 'all' ? redes : redes?.filter(r => r.id === filterRede),
    filterCoord === 'all' ? filteredCoords : filteredCoords.filter(c => c.id === filterCoord),
    filteredCelulas,
    filteredMembers,
    filteredReports,
  );

  const ranking = useMemberRanking(filteredMembers);

  // Filter multiplicações by date
  const filteredMultiplicacoes = useMemo(() => {
    if (!multiplicacoes) return [];
    return multiplicacoes.filter(m => {
      return m.data_multiplicacao >= dateRangeFilter.from && m.data_multiplicacao <= dateRangeFilter.to;
    });
  }, [multiplicacoes, dateRangeFilter]);

  const periodLabel = `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;

  const handleExportCSV = () => {
    const wb = XLSX.utils.book_new();

    // Export current tab data as sheets
    if (byCelula.length > 0) {
      const data = byCelula.map(c => ({
        Célula: c.name,
        Coordenação: c.coordenacaoName,
        Líderes: c.leaderCouple || '—',
        Membros: c.membersCount,
        Visitantes: c.visitors,
        Relatórios: c.reportsCount,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Por Célula');
    }

    if (ranking.length > 0) {
      const data = ranking.map((r, i) => ({
        Posição: i + 1,
        Nome: r.name,
        Célula: r.celulaName,
        'Meses na Igreja': r.monthsInChurch,
        Marcos: r.milestonesCount,
        Pontuação: r.totalScore,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Ranking');
    }

    XLSX.writeFile(wb, `Dados_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-6 w-6" />
              Central de Dados
            </h1>
            <p className="text-sm text-muted-foreground">Período: {periodLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterRede} onValueChange={(v) => { setFilterRede(v); setFilterCoord('all'); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as Redes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Redes</SelectItem>
              {redes?.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCoord} onValueChange={setFilterCoord}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todas Coordenações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Coordenações</SelectItem>
              {filteredCoords.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Células</CardTitle>
                <Home className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{kpis.totalCelulas}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Membros</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{kpis.totalMembers}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Visitantes</CardTitle>
                <UserPlus className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{kpis.totalVisitors}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Relatórios</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{kpis.totalReports}</div></CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="redes" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="redes"><Network className="h-4 w-4 mr-1" />Redes</TabsTrigger>
            <TabsTrigger value="coordenacoes"><FolderTree className="h-4 w-4 mr-1" />Coordenações</TabsTrigger>
            <TabsTrigger value="celulas"><Home className="h-4 w-4 mr-1" />Células</TabsTrigger>
            <TabsTrigger value="lideres"><Users className="h-4 w-4 mr-1" />Líderes</TabsTrigger>
            <TabsTrigger value="relatorios"><FileText className="h-4 w-4 mr-1" />Relatórios</TabsTrigger>
            <TabsTrigger value="multiplicacoes"><GitBranch className="h-4 w-4 mr-1" />Multiplicações</TabsTrigger>
            <TabsTrigger value="ranking"><Trophy className="h-4 w-4 mr-1" />Ranking</TabsTrigger>
          </TabsList>

          {/* Por Rede */}
          <TabsContent value="redes">
            <Card>
              <CardHeader>
                <CardTitle>Dados por Rede</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rede</TableHead>
                      <TableHead>Líder</TableHead>
                      <TableHead className="text-center">Coord.</TableHead>
                      <TableHead className="text-center">Células</TableHead>
                      <TableHead className="text-center">Membros</TableHead>
                      <TableHead className="text-center">Visitantes</TableHead>
                      <TableHead className="text-center">Relatórios</TableHead>
                      <TableHead className="text-center">% Envio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byRede.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.leaderCouple || '—'}</TableCell>
                        <TableCell className="text-center"><Badge variant="outline">{r.coordenacoesCount}</Badge></TableCell>
                        <TableCell className="text-center"><Badge variant="outline">{r.celulasCount}</Badge></TableCell>
                        <TableCell className="text-center">{r.membersCount}</TableCell>
                        <TableCell className="text-center">{r.visitors}</TableCell>
                        <TableCell className="text-center">{r.reportsCount}</TableCell>
                        <TableCell className="text-center"><Badge>{r.submissionRate}%</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por Coordenação */}
          <TabsContent value="coordenacoes">
            <Card>
              <CardHeader><CardTitle>Dados por Coordenação</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coordenação</TableHead>
                      <TableHead>Rede</TableHead>
                      <TableHead>Coordenador</TableHead>
                      <TableHead className="text-center">Células</TableHead>
                      <TableHead className="text-center">Membros</TableHead>
                      <TableHead className="text-center">Visitantes</TableHead>
                      <TableHead className="text-center">Relatórios</TableHead>
                      <TableHead className="text-center">% Envio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byCoordenacao.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.redeName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.leaderCouple || '—'}</TableCell>
                        <TableCell className="text-center"><Badge variant="outline">{c.celulasCount}</Badge></TableCell>
                        <TableCell className="text-center">{c.membersCount}</TableCell>
                        <TableCell className="text-center">{c.visitors}</TableCell>
                        <TableCell className="text-center">{c.reportsCount}</TableCell>
                        <TableCell className="text-center"><Badge>{c.submissionRate}%</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por Célula */}
          <TabsContent value="celulas">
            <Card>
              <CardHeader><CardTitle>Dados por Célula</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Célula</TableHead>
                      <TableHead>Coordenação</TableHead>
                      <TableHead>Líderes</TableHead>
                      <TableHead className="text-center">Membros</TableHead>
                      <TableHead className="text-center">Visitantes</TableHead>
                      <TableHead className="text-center">Relatórios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byCelula.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.coordenacaoName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.leaderCouple || '—'}</TableCell>
                        <TableCell className="text-center">{c.membersCount}</TableCell>
                        <TableCell className="text-center">{c.visitors}</TableCell>
                        <TableCell className="text-center">{c.reportsCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por Líder */}
          <TabsContent value="lideres">
            <Card>
              <CardHeader><CardTitle>Dados por Líder</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Casal Líder</TableHead>
                      <TableHead>Célula</TableHead>
                      <TableHead className="text-center">Relatórios</TableHead>
                      <TableHead className="text-center">Méd. Visitantes</TableHead>
                      <TableHead className="text-center">Membros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byLider.map(l => (
                      <TableRow key={l.coupleId}>
                        <TableCell className="font-medium">{l.coupleName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{l.celulaName}</TableCell>
                        <TableCell className="text-center">{l.reportsCount}</TableCell>
                        <TableCell className="text-center">{l.avgVisitors}</TableCell>
                        <TableCell className="text-center">{l.totalMembers}</TableCell>
                      </TableRow>
                    ))}
                    {byLider.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum líder com célula vinculada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Detalhados */}
          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Detalhados</CardTitle>
                <CardDescription>{filteredReports.length} relatório(s) no período</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Célula</TableHead>
                      <TableHead className="text-center">Membros</TableHead>
                      <TableHead className="text-center">Visitantes</TableHead>
                      <TableHead className="text-center">Crianças</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.slice(0, 50).map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">
                          {r.meeting_date
                            ? format(parseISO(r.meeting_date), 'dd/MM/yyyy', { locale: ptBR })
                            : format(parseISO(r.week_start), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">{r.celula?.name || '—'}</TableCell>
                        <TableCell className="text-center">{r.members_present}</TableCell>
                        <TableCell className="text-center">{r.visitors}</TableCell>
                        <TableCell className="text-center">{r.children}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {r.notes || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredReports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum relatório no período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multiplicações */}
          <TabsContent value="multiplicacoes">
            <Card>
              <CardHeader>
                <CardTitle>Multiplicações no Período</CardTitle>
                <CardDescription>{filteredMultiplicacoes.length} multiplicação(ões)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Célula Origem</TableHead>
                      <TableHead>Célula Destino</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMultiplicacoes.map(m => (
                      <TableRow key={m.id}>
                        <TableCell>{format(parseISO(m.data_multiplicacao), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell className="font-medium">{m.celula_origem?.name || '—'}</TableCell>
                        <TableCell className="font-medium">{m.celula_destino?.name || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {filteredMultiplicacoes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhuma multiplicação no período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Ranking de Membros
                </CardTitle>
                <CardDescription>
                  Pontuação: tempo de igreja (1 pt/mês) + marcos espirituais (10 pts cada)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Célula</TableHead>
                      <TableHead className="text-center">Meses</TableHead>
                      <TableHead>Marcos</TableHead>
                      <TableHead className="text-center">Pontuação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranking.slice(0, 100).map((r, i) => (
                      <TableRow key={r.memberId}>
                        <TableCell className="font-bold text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.celulaName}</TableCell>
                        <TableCell className="text-center">{r.monthsInChurch}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(r.milestones).map(([key, val]) =>
                              val ? (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {milestoneLabels[key]}
                                </Badge>
                              ) : null
                            )}
                            {r.milestonesCount === 0 && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">{r.totalScore}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {ranking.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum membro encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
