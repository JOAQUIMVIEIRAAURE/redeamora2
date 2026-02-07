import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCelula, useUpdateCelula, Celula } from '@/hooks/useCelulas';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useProfiles } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { Cake } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  coordenacao_id: z.string().min(1, 'Coordenação é obrigatória'),
  leader_id: z.string().optional(),
  leader_birth_date: z.string().optional(),
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
  const { data: profiles } = useProfiles();
  const createCelula = useCreateCelula();
  const updateCelula = useUpdateCelula();
  const [selectedLeaderBirthDate, setSelectedLeaderBirthDate] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: celula?.name || '',
      coordenacao_id: celula?.coordenacao_id || '',
      leader_id: celula?.leader_id || '',
      leader_birth_date: '',
      address: celula?.address || '',
      meeting_day: celula?.meeting_day || '',
      meeting_time: celula?.meeting_time || '',
    },
  });
  
  const selectedLeaderId = form.watch('leader_id');
  
  // Load leader's birth date when leader is selected
  useEffect(() => {
    async function loadLeaderBirthDate() {
      if (selectedLeaderId) {
        const { data } = await supabase
          .from('profiles')
          .select('birth_date')
          .eq('id', selectedLeaderId)
          .single();
        
        if (data?.birth_date) {
          setSelectedLeaderBirthDate(data.birth_date);
          form.setValue('leader_birth_date', data.birth_date);
        } else {
          setSelectedLeaderBirthDate(null);
          form.setValue('leader_birth_date', '');
        }
      } else {
        setSelectedLeaderBirthDate(null);
        form.setValue('leader_birth_date', '');
      }
    }
    loadLeaderBirthDate();
  }, [selectedLeaderId, form]);
  
  async function onSubmit(data: FormData) {
    try {
      const payload = {
        name: data.name,
        coordenacao_id: data.coordenacao_id,
        leader_id: data.leader_id || null,
        address: data.address || null,
        meeting_day: data.meeting_day || null,
        meeting_time: data.meeting_time || null,
      };
      
      // Update leader's birth date if provided
      if (data.leader_id && data.leader_birth_date) {
        await supabase
          .from('profiles')
          .update({ birth_date: data.leader_birth_date })
          .eq('id', data.leader_id);
      }
      
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
            
            {selectedLeaderId && (
              <FormField
                control={form.control}
                name="leader_birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Cake className="h-4 w-4 text-amber-500" />
                      Data de Nascimento do Líder
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Para receber alertas de aniversário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
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
