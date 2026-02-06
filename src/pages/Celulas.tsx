import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Celulas() {
  return (
    <AppLayout title="Células">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gerencie as células e seus encontros
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Célula
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Células</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhuma célula cadastrada ainda. Clique em "Nova Célula" para começar.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
