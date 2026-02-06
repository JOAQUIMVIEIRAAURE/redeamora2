import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Users2, CheckCircle2, Circle, Link2, Loader2 } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useCasais } from '@/hooks/useCasais';

interface CelulaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celulaId: string;
  celulaName: string;
}

const MARCOS_ESPIRITUAIS = [
  { key: 'batismo', label: 'Batismo' },
  { key: 'encontro_com_deus', label: 'Encontro com Deus' },
  { key: 'renovo', label: 'Renovo' },
  { key: 'encontro_de_casais', label: 'Encontro de Casais' },
  { key: 'curso_lidere', label: 'Curso Lidere' },
] as const;

export function CelulaDetailsDialog({ open, onOpenChange, celulaId, celulaName }: CelulaDetailsDialogProps) {
  const { data: members, isLoading: membersLoading } = useMembers(celulaId);
  const { data: casais, isLoading: casaisLoading } = useCasais(celulaId);

  const isLoading = membersLoading || casaisLoading;

  // Calculate statistics
  const membrosStats = {
    total: members?.length || 0,
    batismo: members?.filter(m => m.batismo).length || 0,
    encontro_com_deus: members?.filter(m => m.encontro_com_deus).length || 0,
    renovo: members?.filter(m => m.renovo).length || 0,
    encontro_de_casais: members?.filter(m => m.encontro_de_casais).length || 0,
    curso_lidere: members?.filter(m => m.curso_lidere).length || 0,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {celulaName}
          </DialogTitle>
          <DialogDescription>
            Visualização detalhada dos membros e casais da célula
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="resumo" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="membros">Membros ({members?.length || 0})</TabsTrigger>
              <TabsTrigger value="casais">Casais ({casais?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Membros</CardTitle>
                    <CardDescription>Total de membros ativos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{membrosStats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Casais</CardTitle>
                    <CardDescription>Casais vinculados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{casais?.length || 0}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Marcos Espirituais</CardTitle>
                  <CardDescription>Progresso dos membros</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MARCOS_ESPIRITUAIS.map(({ key, label }) => {
                      const count = membrosStats[key as keyof typeof membrosStats];
                      const percentage = membrosStats.total > 0 
                        ? Math.round((count / membrosStats.total) * 100) 
                        : 0;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm">{label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <Badge variant="secondary" className="min-w-[60px] justify-center">
                              {count}/{membrosStats.total}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="membros">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {members?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum membro cadastrado
                    </div>
                  ) : (
                    members?.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.profile?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {member.profile?.name?.charAt(0) || 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.profile?.name || 'Sem nome'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {member.profile?.email || 'Sem email'}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {MARCOS_ESPIRITUAIS.map(({ key, label }) => {
                                const completed = member[key as keyof typeof member];
                                return (
                                  <Badge 
                                    key={key} 
                                    variant={completed ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {completed ? (
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                    ) : (
                                      <Circle className="h-3 w-3 mr-1" />
                                    )}
                                    {label.split(' ')[0]}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="casais">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {casais?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum casal vinculado
                    </div>
                  ) : (
                    casais?.map((casal) => (
                      <Card key={casal.id} className="bg-gradient-to-r from-primary/5 to-primary/10">
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={casal.member1?.profile?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {casal.member1?.profile?.name?.charAt(0) || 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {casal.member1?.profile?.name || 'Sem nome'}
                              </span>
                            </div>

                            <Link2 className="h-5 w-5 text-primary flex-shrink-0" />

                            <div className="flex items-center gap-2">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={casal.member2?.profile?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {casal.member2?.profile?.name?.charAt(0) || 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {casal.member2?.profile?.name || 'Sem nome'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
