import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ClipboardCheck, ChevronDown, ChevronUp, Calendar, Eye, AlertCircle } from 'lucide-react';
import { Supervisao } from '@/hooks/useSupervisoes';
import { SupervisaoDetailsDialog } from './supervisor/SupervisaoDetailsDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupervisoesListProps {
  supervisoes: Supervisao[];
  title?: string;
  showCoordenacao?: boolean;
}

export function SupervisoesList({ supervisoes, title = 'Supervisões', showCoordenacao = false }: SupervisoesListProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedSupervisao, setSelectedSupervisao] = useState<Supervisao | null>(null);

  if (!supervisoes || supervisoes.length === 0) {
    return null;
  }

  const realizadas = supervisoes.filter(s => s.celula_realizada).length;
  const naoRealizadas = supervisoes.length - realizadas;

  return (
    <>
      <Card>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>
                      {supervisoes.length} supervisão(ões) • {realizadas} realizadas • {naoRealizadas} não realizadas
                    </CardDescription>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3">
              {supervisoes.map(supervisao => (
                <Card 
                  key={supervisao.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedSupervisao(supervisao)}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {format(new Date(supervisao.data_supervisao), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{supervisao.celula?.name}</h4>
                            {!supervisao.celula_realizada && (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {showCoordenacao && supervisao.celula?.coordenacao?.name && (
                              <span>{supervisao.celula.coordenacao.name} • </span>
                            )}
                            Supervisor: {supervisao.supervisor?.profile?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {supervisao.celula_realizada ? (
                          <Badge variant="default">Realizada</Badge>
                        ) : (
                          <Badge variant="destructive">Não Realizada</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {selectedSupervisao && (
        <SupervisaoDetailsDialog
          open={!!selectedSupervisao}
          onOpenChange={(open) => !open && setSelectedSupervisao(null)}
          supervisao={selectedSupervisao}
        />
      )}
    </>
  );
}
