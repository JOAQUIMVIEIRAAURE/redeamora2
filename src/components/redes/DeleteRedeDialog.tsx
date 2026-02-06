import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteRede } from '@/hooks/useRedes';

interface DeleteRedeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redeId: string | null;
  redeName: string;
}

export function DeleteRedeDialog({ open, onOpenChange, redeId, redeName }: DeleteRedeDialogProps) {
  const deleteRede = useDeleteRede();
  
  async function handleDelete() {
    if (!redeId) return;
    
    try {
      await deleteRede.mutateAsync(redeId);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Rede</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a rede <strong>{redeName}</strong>? 
            Esta ação não pode ser desfeita e todas as coordenações e células associadas serão afetadas.
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
