import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface InlineCoupleFieldsProps {
  form: UseFormReturn<any>;
  spouse1Field?: string;
  spouse2Field?: string;
  label?: string;
}

export function InlineCoupleFields({ 
  form, 
  spouse1Field = 'spouse1_name',
  spouse2Field = 'spouse2_name',
  label = 'Casal de Liderança'
}: InlineCoupleFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={spouse1Field}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Esposo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do esposo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={spouse2Field}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Esposa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da esposa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
