import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { WeeklyReport } from '@/hooks/useWeeklyReports';
import { format, parseISO } from 'date-fns';

interface ReportDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: WeeklyReport | null;
  onConfirm: (id: string) => void;
  isLoading?: boolean;
}

export function ReportDeleteDialog({ open, onOpenChange, report, onConfirm, isLoading }: ReportDeleteDialogProps) {
  const reportDate = report?.meeting_date || report?.week_start;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Excluir Relatório
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o relatório da célula{' '}
            <strong>{report?.celula?.name}</strong> do dia{' '}
            <strong>{reportDate ? format(parseISO(reportDate), 'dd/MM/yyyy') : 'N/A'}</strong>?
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => report && onConfirm(report.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
