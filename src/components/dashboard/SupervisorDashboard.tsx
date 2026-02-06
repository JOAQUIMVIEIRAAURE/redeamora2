import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ClipboardCheck, Plus, Eye, Calendar } from 'lucide-react';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useSupervisores, useSupervisoesBySupervisor, Supervisao } from '@/hooks/useSupervisoes';
import { useCelulas } from '@/hooks/useCelulas';
import { SupervisaoFormDialog } from './supervisor/SupervisaoFormDialog';
import { SupervisaoDetailsDialog } from './supervisor/SupervisaoDetailsDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SupervisorDashboard() {
  const { data: coordenacoes, isLoading: coordenacoesLoading } = useCoordenacoes();
  const { data: supervisores, isLoading: supervisoresLoading } = useSupervisores();
  
  const [selectedCoordenacao, setSelectedCoordenacao] = useState<string>('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupervisao, setSelectedSupervisao] = useState<Supervisao | null>(null);
  
  const { data: celulas } = useCelulas();
  const { data: supervisoes, isLoading: supervisoesLoading } = useSupervisoesBySupervisor(selectedSupervisor);

  // Filter supervisors by selected coordenacao
  const filteredSupervisores = supervisores?.filter(s => 
    !selectedCoordenacao || s.coordenacao_id === selectedCoordenacao
  ) || [];

  // Filter celulas by selected coordenacao
  const filteredCelulas = celulas?.filter(c => 
    c.coordenacao_id === selectedCoordenacao
  ) || [];

  const currentSupervisor = supervisores?.find(s => s.id === selectedSupervisor);

  if (coordenacoesLoading || supervisoresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard do Supervisor</h2>
          <p className="text-muted-foreground">Registre e acompanhe suas supervisões de células</p>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coordenação</CardTitle>
            <CardDescription>Selecione sua coordenação</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCoordenacao} onValueChange={(value) => {
              setSelectedCoordenacao(value);
              setSelectedSupervisor('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma coordenação" />
              </SelectTrigger>
              <SelectContent>
                {coordenacoes?.map(coord => (
                  <SelectItem key={coord.id} value={coord.id}>
                    {coord.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supervisor</CardTitle>
            <CardDescription>Identifique-se como supervisor</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedSupervisor} 
              onValueChange={setSelectedSupervisor}
              disabled={!selectedCoordenacao}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCoordenacao ? "Selecione seu perfil" : "Selecione a coordenação primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSupervisores.map(sup => (
                  <SelectItem key={sup.id} value={sup.id}>
                    {sup.profile?.name || 'Supervisor'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCoordenacao && filteredSupervisores.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Nenhum supervisor cadastrado nesta coordenação. Peça ao administrador para cadastrar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedSupervisor && (
        <>
          {/* Action Button */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Nova Supervisão</h3>
                  <p className="text-sm text-muted-foreground">
                    Registre uma nova visita de supervisão a uma célula
                  </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Supervisão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supervision History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Histórico de Supervisões
              </CardTitle>
              <CardDescription>
                {supervisoes?.length || 0} supervisão(ões) registrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supervisoesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : supervisoes && supervisoes.length > 0 ? (
                <div className="space-y-4">
                  {supervisoes.map(supervisao => (
                    <Card key={supervisao.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedSupervisao(supervisao)}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">
                                {format(new Date(supervisao.data_supervisao), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold">{supervisao.celula?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {supervisao.horario_inicio} - {supervisao.horario_termino}
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
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma supervisão registrada ainda</p>
                  <p className="text-sm">Clique em "Registrar Supervisão" para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedSupervisor && selectedCoordenacao && filteredSupervisores.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecione seu perfil</h3>
            <p className="text-muted-foreground mt-1">
              Identifique-se como supervisor para registrar supervisões
            </p>
          </CardContent>
        </Card>
      )}

      {!selectedCoordenacao && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecione uma coordenação</h3>
            <p className="text-muted-foreground mt-1">
              Escolha sua coordenação para começar a registrar supervisões
            </p>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <SupervisaoFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        supervisorId={selectedSupervisor}
        celulas={filteredCelulas}
      />

      {/* Details Dialog */}
      {selectedSupervisao && (
        <SupervisaoDetailsDialog
          open={!!selectedSupervisao}
          onOpenChange={(open) => !open && setSelectedSupervisao(null)}
          supervisao={selectedSupervisao}
        />
      )}
    </div>
  );
}
