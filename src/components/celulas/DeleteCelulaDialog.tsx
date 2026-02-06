import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteCelula } from '@/hooks/useCelulas';

interface DeleteCelulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celulaId: string | null;
  celulaName: string;
}

export function DeleteCelulaDialog({ open, onOpenChange, celulaId, celulaName }: DeleteCelulaDialogProps) {
  const deleteCelula = useDeleteCelula();
  
  async function handleDelete() {
    if (!celulaId) return;
    
    try {
      await deleteCelula.mutateAsync(celulaId);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Célula</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a célula <strong>{celulaName}</strong>? 
            Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
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
