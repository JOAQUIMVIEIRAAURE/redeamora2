import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Redes() {
  return (
    <AppLayout title="Redes">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gerencie as redes e seus líderes
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Rede
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Redes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhuma rede cadastrada ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
