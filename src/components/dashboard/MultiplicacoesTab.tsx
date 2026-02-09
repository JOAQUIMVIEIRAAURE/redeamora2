import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GitBranch, ArrowRight, Loader2 } from 'lucide-react';
import { useMultiplicacoes, useCreateMultiplicacao, useDeleteMultiplicacao } from '@/hooks/useMultiplicacoes';
import { useCelulas } from '@/hooks/useCelulas';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function MultiplicacoesTab() {
  const { data: multiplicacoes = [], isLoading } = useMultiplicacoes();
  const { data: celulas = [] } = useCelulas();
  const createMutation = useCreateMultiplicacao();
  const deleteMutation = useDeleteMultiplicacao();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    celula_origem_id: '',
    celula_destino_id: '',
    data_multiplicacao: '',
    notes: '',
  });

  // Células que já têm origem registrada não podem ser selecionadas como destino
  const celulasComOrigem = multiplicacoes.map(m => m.celula_destino_id);
  const celulasDisponiveis = celulas.filter(c => !celulasComOrigem.includes(c.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.celula_origem_id || !formData.celula_destino_id || !formData.data_multiplicacao) return;

    await createMutation.mutateAsync({
      celula_origem_id: formData.celula_origem_id,
      celula_destino_id: formData.celula_destino_id,
      data_multiplicacao: formData.data_multiplicacao,
      notes: formData.notes || undefined,
    });

    setFormData({ celula_origem_id: '', celula_destino_id: '', data_multiplicacao: '', notes: '' });
    setIsDialogOpen(false);
  };

  // Agrupa multiplicações por célula de origem para visualização de árvore
  const origemGroups = multiplicacoes.reduce((acc, m) => {
    const origemId = m.celula_origem_id;
    if (!acc[origemId]) {
      acc[origemId] = {
        origem: m.celula_origem,
        filhas: [],
      };
    }
    acc[origemId].filhas.push(m);
    return acc;
  }, {} as Record<string, { origem: any; filhas: typeof multiplicacoes }>);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Multiplicação de Células
          </h2>
          <p className="text-sm text-muted-foreground">
            Rastreie a origem e crescimento das células
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Multiplicação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Multiplicação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Célula de Origem (Matriz)</Label>
                <Select
                  value={formData.celula_origem_id}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, celula_origem_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a célula matriz" />
                  </SelectTrigger>
                  <SelectContent>
                    {celulas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Célula Multiplicada (Nova)</Label>
                <Select
                  value={formData.celula_destino_id}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, celula_destino_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a célula que nasceu" />
                  </SelectTrigger>
                  <SelectContent>
                    {celulasDisponiveis
                      .filter(c => c.id !== formData.celula_origem_id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data da Multiplicação</Label>
                <Input
                  type="date"
                  value={formData.data_multiplicacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_multiplicacao: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detalhes sobre a multiplicação..."
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tree View - Grouped by Origin */}
      {Object.keys(origemGroups).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(origemGroups).map((group) => (
            <Card key={group.origem?.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  {group.origem?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  {group.filhas.map((m) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{m.celula_destino?.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(m.data_multiplicacao), 'MMM/yy', { locale: ptBR })}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Multiplicações</CardTitle>
        </CardHeader>
        <CardContent>
          {multiplicacoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma multiplicação registrada ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Célula Origem</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Célula Multiplicada</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {multiplicacoes.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.celula_origem?.name}</TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>{m.celula_destino?.name}</TableCell>
                    <TableCell>
                      {format(new Date(m.data_multiplicacao), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {m.notes || '-'}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover multiplicação?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso removerá o registro de origem da célula {m.celula_destino?.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(m.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
