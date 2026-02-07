import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { WeeklyReport } from '@/hooks/useWeeklyReports';
import { format, parseISO } from 'date-fns';

interface ReportEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: WeeklyReport | null;
  onSave: (data: {
    id: string;
    members_present: number;
    leaders_in_training: number;
    discipleships: number;
    visitors: number;
    children: number;
    notes: string | null;
  }) => void;
  isLoading?: boolean;
}

export function ReportEditDialog({ open, onOpenChange, report, onSave, isLoading }: ReportEditDialogProps) {
  const [formData, setFormData] = useState({
    members_present: 0,
    leaders_in_training: 0,
    discipleships: 0,
    visitors: 0,
    children: 0,
    notes: '',
  });

  useEffect(() => {
    if (report) {
      setFormData({
        members_present: report.members_present,
        leaders_in_training: report.leaders_in_training,
        discipleships: report.discipleships,
        visitors: report.visitors,
        children: report.children,
        notes: report.notes || '',
      });
    }
  }, [report]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    
    onSave({
      id: report.id,
      ...formData,
      notes: formData.notes || null,
    });
  };

  const reportDate = report?.meeting_date || report?.week_start;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Relatório</DialogTitle>
          <DialogDescription>
            {report?.celula?.name} - {reportDate ? format(parseISO(reportDate), 'dd/MM/yyyy') : 'Data não disponível'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="members_present">Membros Presentes</Label>
              <Input
                id="members_present"
                type="number"
                min="0"
                value={formData.members_present}
                onChange={(e) => setFormData({ ...formData, members_present: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaders_in_training">Líderes em Treinamento</Label>
              <Input
                id="leaders_in_training"
                type="number"
                min="0"
                value={formData.leaders_in_training}
                onChange={(e) => setFormData({ ...formData, leaders_in_training: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discipleships">Discipulados</Label>
              <Input
                id="discipleships"
                type="number"
                min="0"
                value={formData.discipleships}
                onChange={(e) => setFormData({ ...formData, discipleships: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitors">Visitantes</Label>
              <Input
                id="visitors"
                type="number"
                min="0"
                value={formData.visitors}
                onChange={(e) => setFormData({ ...formData, visitors: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Crianças</Label>
              <Input
                id="children"
                type="number"
                min="0"
                value={formData.children}
                onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações sobre a reunião..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
