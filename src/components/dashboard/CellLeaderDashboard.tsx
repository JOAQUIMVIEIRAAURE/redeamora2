import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Search } from 'lucide-react';
import { useCelulas } from '@/hooks/useCelulas';
import { CelulaDetailsDialog } from './CelulaDetailsDialog';

export function CellLeaderDashboard() {
  const { data: celulas, isLoading } = useCelulas();
  const [selectedCelula, setSelectedCelula] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userCelulas = (celulas || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Minhas Células</h2>
        <p className="text-muted-foreground">Gerencie suas células e relatórios semanais</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar célula pelo nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {userCelulas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">
              {search ? 'Nenhuma célula encontrada' : 'Nenhuma célula vinculada'}
            </h3>
            <p className="text-muted-foreground mt-1">
              {search ? 'Tente outro termo de busca.' : 'Você ainda não está vinculado a nenhuma célula.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userCelulas.map(celula => (
            <Card
              key={celula.id}
              className="cursor-pointer hover:ring-2 ring-primary transition-all"
              onClick={() => setSelectedCelula({ id: celula.id, name: celula.name })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {celula.name}
                </CardTitle>
                <CardDescription>
                  {celula.meeting_day && `${celula.meeting_day}`}
                  {celula.meeting_time && ` às ${celula.meeting_time}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {celula.leadership_couple && (
                  <p className="text-sm font-medium text-foreground">
                    👫 {celula.leadership_couple.spouse1?.name} & {celula.leadership_couple.spouse2?.name}
                  </p>
                )}
                {celula.address && (
                  <p className="text-sm text-muted-foreground">{celula.address}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCelula && (
        <CelulaDetailsDialog
          open={!!selectedCelula}
          onOpenChange={(open) => { if (!open) setSelectedCelula(null); }}
          celulaId={selectedCelula.id}
          celulaName={selectedCelula.name}
        />
      )}
    </div>
  );
}
