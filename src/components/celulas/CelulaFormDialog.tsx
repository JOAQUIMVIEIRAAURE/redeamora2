import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCelula, useUpdateCelula, Celula } from '@/hooks/useCelulas';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { LeadershipCoupleSelect } from '@/components/leadership/LeadershipCoupleSelect';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  coordenacao_id: z.string().min(1, 'Coordenação é obrigatória'),
  leadership_couple_id: z.string().optional().nullable(),
  address: z.string().optional(),
  meeting_day: z.string().optional(),
  meeting_time: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CelulaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celula?: Celula | null;
}

const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

export function CelulaFormDialog({ open, onOpenChange, celula }: CelulaFormDialogProps) {
  const { data: coordenacoes } = useCoordenacoes();
  const createCelula = useCreateCelula();
  const updateCelula = useUpdateCelula();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: celula?.name || '',
      coordenacao_id: celula?.coordenacao_id || '',
      leadership_couple_id: celula?.leadership_couple_id || null,
      address: celula?.address || '',
      meeting_day: celula?.meeting_day || '',
      meeting_time: celula?.meeting_time || '',
    },
  });
  
  async function onSubmit(data: FormData) {
    try {
      const payload = {
        name: data.name,
        coordenacao_id: data.coordenacao_id,
        leadership_couple_id: data.leadership_couple_id || null,
        address: data.address || null,
        meeting_day: data.meeting_day || null,
        meeting_time: data.meeting_time || null,
      };
      
      if (celula) {
        await updateCelula.mutateAsync({ id: celula.id, ...payload });
      } else {
        await createCelula.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{celula ? 'Editar Célula' : 'Nova Célula'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Célula</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Célula dos Jovens" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="coordenacao_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordenação</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma coordenação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coordenacoes?.map((coord) => (
                        <SelectItem key={coord.id} value={coord.id}>
                          {coord.name}
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
                    label="Líderes da Célula (Casal)"
                    placeholder="Selecione o casal líder"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rua das Flores, 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meeting_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Encontro</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
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
                name="meeting_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCelula.isPending || updateCelula.isPending}>
                {celula ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
