import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Presenca() {
  return (
    <AppLayout title="Controle de Presença">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Registre e acompanhe a presença nas reuniões
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Reunião
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reuniões Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhuma reunião registrada ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
