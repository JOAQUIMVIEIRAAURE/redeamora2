import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { GitBranch, Plus, Save, Loader2, Trash2 } from 'lucide-react';
import { useCelulas } from '@/hooks/useCelulas';
import { useMultiplicacoesJson } from '@/hooks/useMultiplicacoesJson';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MultiplicacoesVisualProps {
  celulas?: { id: string; name: string; leader_id?: string | null }[];
}

export function MultiplicacoesVisual({ celulas: propCelulas }: MultiplicacoesVisualProps) {
  const { data: fetchedCelulas } = useCelulas();
  const celulas = propCelulas || fetchedCelulas || [];
  
  const { treeData, isLoading, addMultiplicacao, removeMultiplicacao } = useMultiplicacoesJson();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    parentId: '',
    childId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentId || !formData.childId) return;

    if (formData.parentId === formData.childId) {
      alert("Uma célula não pode ser mãe dela mesma.");
      return;
    }

    setIsSaving(true);
    await addMultiplicacao(formData.childId, formData.parentId, formData.date, formData.notes);
    setIsSaving(false);
    setIsDialogOpen(false);
    setFormData({ parentId: '', childId: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
  };

  const renderNode = (celulaId: string, level = 0) => {
    const celula = celulas.find(c => c.id === celulaId);
    if (!celula) return null;

    const children = Object.values(treeData)
      .filter(node => node.parentId === celulaId)
      .map(node => node.id);

    const nodeData = treeData[celulaId];

    return (
      <div key={celulaId} className="relative" style={{ marginLeft: level * 32 }}>
        {level > 0 && (
          <div className="absolute -left-4 top-6 w-4 h-[2px] bg-muted-foreground/30" />
        )}
        {level > 0 && (
          <div className="absolute -left-4 -top-4 w-[2px] h-[calc(100%+16px)] bg-muted-foreground/30" />
        )}
        
        <Card className="mb-4 relative border-l-4 border-l-primary/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{celula.name}</span>
                {nodeData?.multiplicationDate && (
                  <Badge variant="secondary" className="text-xs">
                    Desde {format(new Date(nodeData.multiplicationDate), 'MMM yyyy', { locale: ptBR })}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {celula.leader_id ? 'Com líder' : 'Sem líder'} • {children.length} {children.length === 1 ? 'filha' : 'filhas'}
              </div>
            </div>

            {nodeData?.parentId && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm(`Desvincular ${celula.name} da sua célula mãe?`)) {
                    removeMultiplicacao(celulaId);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="pl-4 border-l border-dashed border-muted-foreground/20 ml-4">
          {children.map(childId => renderNode(childId, level))}
        </div>
      </div>
    );
  };

  // Encontrar células raiz (aquelas que não têm pai definido na árvore)
  const roots = celulas.filter(c => !treeData[c.id]?.parentId);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Árvore de Multiplicação</h3>
          <p className="text-sm text-muted-foreground">Visualize e gerencie a linhagem das células</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Multiplicação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Multiplicação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Célula Mãe</Label>
                <Select 
                  value={formData.parentId} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, parentId: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a célula mãe" />
                  </SelectTrigger>
                  <SelectContent>
                    {celulas.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Célula Filha (Nova)</Label>
                <Select 
                  value={formData.childId} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, childId: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a célula filha" />
                  </SelectTrigger>
                  <SelectContent>
                    {celulas
                      .filter(c => c.id !== formData.parentId && !treeData[c.id]?.parentId) // Filtra células que já têm mãe
                      .map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data da Multiplicação</Label>
                <Input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {roots.length > 0 ? (
          roots.map(root => {
             // Renderiza apenas raízes que têm filhos ou que foram explicitamente adicionadas à árvore
             const hasChildren = Object.values(treeData).some(node => node.parentId === root.id);
             if (!hasChildren && !treeData[root.id]) return null;
             return renderNode(root.id);
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
            <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma multiplicação registrada.</p>
            <p className="text-sm">Clique em "Nova Multiplicação" para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
