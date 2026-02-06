import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteCoordenacao } from '@/hooks/useCoordenacoes';

interface DeleteCoordenacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coordenacaoId: string | null;
  coordenacaoName: string;
}

export function DeleteCoordenacaoDialog({ open, onOpenChange, coordenacaoId, coordenacaoName }: DeleteCoordenacaoDialogProps) {
  const deleteCoordenacao = useDeleteCoordenacao();
  
  async function handleDelete() {
    if (!coordenacaoId) return;
    
    try {
      await deleteCoordenacao.mutateAsync(coordenacaoId);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Coordenação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a coordenação <strong>{coordenacaoName}</strong>? 
            Esta ação não pode ser desfeita e todas as células associadas serão afetadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
