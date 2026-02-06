import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useCreateMember } from '@/hooks/useMembers';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface MemberFormDialogSimpleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celulaId: string;
}

export function MemberFormDialogSimple({ open, onOpenChange, celulaId }: MemberFormDialogSimpleProps) {
  const createMember = useCreateMember();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });
  
  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      // First, create a profile for the new member
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: data.name,
          email: data.email || null,
          user_id: crypto.randomUUID(), // Generate a placeholder user_id
        })
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      // Then, create the member linked to this profile and celula
      await createMember.mutateAsync({
        profile_id: profile.id,
        celula_id: celulaId,
      });
      
      toast({ title: 'Membro adicionado com sucesso!' });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({ 
        title: 'Erro ao adicionar membro', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Membro</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do membro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Adicionar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
