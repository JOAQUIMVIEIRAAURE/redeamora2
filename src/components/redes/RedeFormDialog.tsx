import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateRede, useUpdateRede, Rede } from '@/hooks/useRedes';
import { useProfiles } from '@/hooks/useProfiles';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  leader_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RedeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rede?: Rede | null;
}

export function RedeFormDialog({ open, onOpenChange, rede }: RedeFormDialogProps) {
  const { data: profiles } = useProfiles();
  const createRede = useCreateRede();
  const updateRede = useUpdateRede();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rede?.name || '',
      leader_id: rede?.leader_id || '',
    },
  });
  
  async function onSubmit(data: FormData) {
    try {
      const payload = {
        name: data.name,
        leader_id: data.leader_id || null,
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
              name="leader_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Líder (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um líder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
