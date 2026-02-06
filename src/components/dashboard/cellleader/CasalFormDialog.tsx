import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreateCasal } from '@/hooks/useCasais';
import { Member } from '@/hooks/useMembers';
import { Heart } from 'lucide-react';

const formSchema = z.object({
  member1_id: z.string().min(1, 'Selecione o primeiro membro'),
  member2_id: z.string().min(1, 'Selecione o segundo membro'),
}).refine((data) => data.member1_id !== data.member2_id, {
  message: "Os membros devem ser diferentes",
  path: ["member2_id"],
});

type FormData = z.infer<typeof formSchema>;

interface CasalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celulaId: string;
  availableMembers: Member[];
}

export function CasalFormDialog({ open, onOpenChange, celulaId, availableMembers }: CasalFormDialogProps) {
  const createCasal = useCreateCasal();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member1_id: '',
      member2_id: '',
    },
  });

  const selectedMember1 = form.watch('member1_id');
  
  async function onSubmit(data: FormData) {
    try {
      await createCasal.mutateAsync({
        celula_id: celulaId,
        member1_id: data.member1_id,
        member2_id: data.member2_id,
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
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Vincular Casal
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="member1_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primeiro Membro</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um membro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.profile?.name || 'Sem nome'}
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
              name="member2_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segundo Membro</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um membro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMembers
                        .filter(m => m.id !== selectedMember1)
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.profile?.name || 'Sem nome'}
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
              <Button type="submit" disabled={createCasal.isPending}>
                Vincular
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
