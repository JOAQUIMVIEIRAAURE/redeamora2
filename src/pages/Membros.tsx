import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Membros() {
  return (
    <AppLayout title="Membros">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Visualize e gerencie os membros das células
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Membro
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhum membro cadastrado ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
