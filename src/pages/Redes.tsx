import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Loader2, MoreVertical, Pencil, Trash2, FolderTree, Heart } from 'lucide-react';
import { useRedes, Rede } from '@/hooks/useRedes';
import { getCoupleDisplayName } from '@/hooks/useLeadershipCouples';
import { RedeFormDialog } from '@/components/redes/RedeFormDialog';
import { DeleteRedeDialog } from '@/components/redes/DeleteRedeDialog';

export default function Redes() {
  const { data: redes, isLoading } = useRedes();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRede, setEditingRede] = useState<Rede | null>(null);
  const [deletingRede, setDeletingRede] = useState<Rede | null>(null);
  
  const filteredRedes = redes?.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.leader?.name.toLowerCase().includes(search.toLowerCase())
  ) || [];
  
  function handleEdit(rede: Rede) {
    setEditingRede(rede);
    setFormOpen(true);
  }
  
  function handleCloseForm(open: boolean) {
    if (!open) {
      setEditingRede(null);
    }
    setFormOpen(open);
  }
  
  return (
    <AppLayout title="Redes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar redes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Rede
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Redes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRedes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {search 
                  ? 'Nenhuma rede encontrada com esse termo.' 
                  : 'Nenhuma rede cadastrada ainda. Clique em "Nova Rede" para começar.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Casal Líder</TableHead>
                    <TableHead>Coordenações</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRedes.map((rede) => (
                    <TableRow key={rede.id}>
                      <TableCell className="font-medium">{rede.name}</TableCell>
                      <TableCell>
                        {rede.leadership_couple ? (
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            <span className="text-sm">{getCoupleDisplayName(rede.leadership_couple)}</span>
                          </div>
                        ) : rede.leader ? (
                          <span className="text-sm">{rede.leader.name}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FolderTree className="h-4 w-4" />
                          {rede._count?.coordenacoes || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(rede)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeletingRede(rede)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      <RedeFormDialog 
        open={formOpen} 
        onOpenChange={handleCloseForm}
        rede={editingRede}
      />
      
      <DeleteRedeDialog
        open={!!deletingRede}
        onOpenChange={(open) => !open && setDeletingRede(null)}
        redeId={deletingRede?.id || null}
        redeName={deletingRede?.name || ''}
      />
    </AppLayout>
  );
}
