import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateRede, useUpdateRede, Rede } from '@/hooks/useRedes';
import { LeadershipCoupleSelect } from '@/components/leadership/LeadershipCoupleSelect';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  leadership_couple_id: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface RedeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rede?: Rede | null;
}

export function RedeFormDialog({ open, onOpenChange, rede }: RedeFormDialogProps) {
  const createRede = useCreateRede();
  const updateRede = useUpdateRede();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rede?.name || '',
      leadership_couple_id: rede?.leadership_couple_id || null,
    },
  });
  
  async function onSubmit(data: FormData) {
    try {
      const payload = {
        name: data.name,
        leadership_couple_id: data.leadership_couple_id || null,
      };
      
      if (rede) {
        await updateRede.mutateAsync({ id: rede.id, ...payload });
      } else {
        await createRede.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rede ? 'Editar Rede' : 'Nova Rede'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Rede</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rede Norte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="leadership_couple_id"
              render={({ field }) => (
                <FormItem>
                  <LeadershipCoupleSelect
                    value={field.value}
                    onChange={field.onChange}
                    label="Líderes da Rede (Casal)"
                    placeholder="Selecione o casal líder"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createRede.isPending || updateRede.isPending}>
                {rede ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
