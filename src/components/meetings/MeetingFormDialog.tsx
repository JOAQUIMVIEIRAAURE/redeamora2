import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateMeeting } from '@/hooks/useMeetings';
import { useCelulas } from '@/hooks/useCelulas';
import { format } from 'date-fns';

const formSchema = z.object({
  celula_id: z.string().min(1, 'Selecione uma célula'),
  date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MeetingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCelulaId?: string;
}

export function MeetingFormDialog({ open, onOpenChange, preselectedCelulaId }: MeetingFormDialogProps) {
  const { data: celulas } = useCelulas();
  const createMeeting = useCreateMeeting();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      celula_id: preselectedCelulaId || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });
  
  async function onSubmit(data: FormData) {
    try {
      await createMeeting.mutateAsync({
        celula_id: data.celula_id,
        date: data.date,
        notes: data.notes || null,
      });
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
          <DialogTitle>Nova Reunião</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="celula_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Célula</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma célula" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {celulas?.map((celula) => (
                        <SelectItem key={celula.id} value={celula.id}>
                          {celula.name}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Reunião</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas sobre a reunião..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMeeting.isPending}>
                Criar Reunião
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
