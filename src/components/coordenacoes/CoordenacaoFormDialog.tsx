import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCoordenacao, useUpdateCoordenacao, Coordenacao } from '@/hooks/useCoordenacoes';
import { useRedes } from '@/hooks/useRedes';
import { LeadershipCoupleSelect } from '@/components/leadership/LeadershipCoupleSelect';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  rede_id: z.string().min(1, 'Rede é obrigatória'),
  leadership_couple_id: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface CoordenacaoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coordenacao?: Coordenacao | null;
}

export function CoordenacaoFormDialog({ open, onOpenChange, coordenacao }: CoordenacaoFormDialogProps) {
  const { data: redes } = useRedes();
  const createCoordenacao = useCreateCoordenacao();
  const updateCoordenacao = useUpdateCoordenacao();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: coordenacao?.name || '',
      rede_id: coordenacao?.rede_id || '',
      leadership_couple_id: coordenacao?.leadership_couple_id || null,
    },
  });
  
  async function onSubmit(data: FormData) {
    try {
      const payload = {
        name: data.name,
        rede_id: data.rede_id,
        leadership_couple_id: data.leadership_couple_id || null,
      };
      
      if (coordenacao) {
        await updateCoordenacao.mutateAsync({ id: coordenacao.id, ...payload });
      } else {
        await createCoordenacao.mutateAsync(payload);
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
          <DialogTitle>{coordenacao ? 'Editar Coordenação' : 'Nova Coordenação'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Coordenação</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Coordenação Centro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rede_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rede</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma rede" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {redes?.map((rede) => (
                        <SelectItem key={rede.id} value={rede.id}>
                          {rede.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    label="Coordenadores (Casal)"
                    placeholder="Selecione o casal coordenador"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCoordenacao.isPending || updateCoordenacao.isPending}>
                {coordenacao ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
