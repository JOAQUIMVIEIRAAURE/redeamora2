import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import { WeeklyReport, useUpdateWeeklyReport } from '@/hooks/useWeeklyReports';
import { ReportsHistoryTable } from '@/components/reports/ReportsHistoryTable';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { startOfWeek, isSameWeek } from 'date-fns';

interface CellLeaderHistoryTabProps {
  reports: WeeklyReport[];
  isLoading?: boolean;
}

export function CellLeaderHistoryTab({ reports, isLoading }: CellLeaderHistoryTabProps) {
  const { toast } = useToast();
  const updateReport = useUpdateWeeklyReport();

  // Check if a report is from current week (editable)
  const isCurrentWeek = (report: WeeklyReport) => {
    const reportDate = new Date(report.meeting_date || report.week_start);
    return isSameWeek(reportDate, new Date(), { weekStartsOn: 1 });
  };

  // Only allow editing reports from current week
  const handleEditReport = (data: {
    id: string;
    members_present: number;
    leaders_in_training: number;
    discipleships: number;
    visitors: number;
    children: number;
    notes: string | null;
  }) => {
    const report = reports.find(r => r.id === data.id);
    if (report && !isCurrentWeek(report)) {
      toast({
        title: 'Ação não permitida',
        description: 'Você só pode editar relatórios da semana vigente',
        variant: 'destructive',
      });
      return;
    }

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

  // Cell leaders can only edit, not delete
  const handleDeleteReport = () => {
    toast({
      title: 'Ação não permitida',
      description: 'Apenas coordenadores podem excluir relatórios',
      variant: 'destructive',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Relatórios
        </CardTitle>
        <CardDescription>
          Visualize e edite relatórios da semana vigente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReportsHistoryTable
          reports={reports}
          onEdit={handleEditReport}
          onDelete={handleDeleteReport}
          isUpdating={updateReport.isPending}
          isDeleting={false}
          showCelulaColumn={false}
          showCoordenacaoColumn={false}
        />
      </CardContent>
    </Card>
  );
}
