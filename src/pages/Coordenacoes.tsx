import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Coordenacoes() {
  return (
    <AppLayout title="Coordenações">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gerencie as coordenações e seus coordenadores
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Coordenação
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Coordenações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhuma coordenação cadastrada ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
