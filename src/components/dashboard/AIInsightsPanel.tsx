import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, FileText, Loader2, RefreshCw, X } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';
import { WeeklyReport } from '@/hooks/useWeeklyReports';
import ReactMarkdown from 'react-markdown';

interface AIInsightsPanelProps {
  reports: WeeklyReport[];
  periodLabel: string;
  context?: string;
}

export function AIInsightsPanel({ reports, periodLabel, context }: AIInsightsPanelProps) {
  const { isLoading, insight, generateInsight, clearInsight } = useAIInsights();
  const [activeTab, setActiveTab] = useState<'growth_analysis' | 'executive_summary'>('growth_analysis');

  // Transform reports into the format expected by the AI
  const prepareData = () => {
    const groupedByCelula = reports.reduce((acc, report) => {
      const celulaId = report.celula_id;
      if (!acc[celulaId]) {
        acc[celulaId] = {
          celula_name: report.celula?.name || 'Célula Desconhecida',
          coordenacao_name: report.celula?.coordenacao?.name || 'Coordenação Desconhecida',
          reports: [],
        };
      }
      acc[celulaId].reports.push({
        meeting_date: report.meeting_date || report.week_start,
        members_present: report.members_present,
        leaders_in_training: report.leaders_in_training,
        discipleships: report.discipleships,
        visitors: report.visitors,
        children: report.children,
      });
      return acc;
    }, {} as Record<string, { celula_name: string; coordenacao_name: string; reports: any[] }>);

    return Object.values(groupedByCelula);
  };

  const handleGenerateInsight = async (type: 'growth_analysis' | 'executive_summary') => {
    const data = prepareData();
    if (data.length === 0) {
      return;
    }
    await generateInsight(type, data, periodLabel);
  };

  if (reports.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-medium text-muted-foreground">Insights com IA</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione um período com relatórios para gerar análises
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Insights com IA</CardTitle>
              <CardDescription>
                Análises inteligentes baseadas nos relatórios
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Lovable AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="growth_analysis" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Análise de Crescimento</span>
              <span className="sm:hidden">Crescimento</span>
            </TabsTrigger>
            <TabsTrigger value="executive_summary" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resumo Executivo</span>
              <span className="sm:hidden">Resumo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="growth_analysis" className="space-y-4">
            {!insight || insight.type !== 'growth_analysis' ? (
              <div className="text-center py-6">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Identifique tendências, células em destaque e pontos de atenção
                </p>
                <Button 
                  onClick={() => handleGenerateInsight('growth_analysis')}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar Análise
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <InsightResult 
                insight={insight} 
                onRefresh={() => handleGenerateInsight('growth_analysis')}
                onClear={clearInsight}
                isLoading={isLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="executive_summary" className="space-y-4">
            {!insight || insight.type !== 'executive_summary' ? (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Gere um resumo consolidado para apresentar à liderança
                </p>
                <Button 
                  onClick={() => handleGenerateInsight('executive_summary')}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar Resumo
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <InsightResult 
                insight={insight} 
                onRefresh={() => handleGenerateInsight('executive_summary')}
                onClear={clearInsight}
                isLoading={isLoading}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface InsightResultProps {
  insight: {
    insight: string;
    type: string;
    period: string;
    generatedAt: string;
  };
  onRefresh: () => void;
  onClear: () => void;
  isLoading: boolean;
}

function InsightResult({ insight, onRefresh, onClear, isLoading }: InsightResultProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Gerado em: {new Date(insight.generatedAt).toLocaleString('pt-BR')}
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerar</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            className="gap-1"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">Limpar</span>
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[400px] rounded-lg border bg-card p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{insight.insight}</ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
}
