import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, Users2, Link2, Loader2, Plus, Trash2, ChevronDown, ChevronUp, FileText, History, Image } from 'lucide-react';
import { Member, useMembers, useUpdateMember, useRemoveMember } from '@/hooks/useMembers';
import { useCasais, useDeleteCasal } from '@/hooks/useCasais';
import { useWeeklyReports, useCreateWeeklyReport, useUpdateWeeklyReport, useDeleteWeeklyReport, getCurrentWeekStart } from '@/hooks/useWeeklyReports';
import { MemberFormDialogSimple } from './cellleader/MemberFormDialogSimple';
import { CasalFormDialog } from './cellleader/CasalFormDialog';
import { CelulaPhotoUpload } from './cellleader/CelulaPhotoUpload';
import { CelulaPhotoGallery } from './CelulaPhotoGallery';
import { ReportsHistoryTable } from '@/components/reports/ReportsHistoryTable';
import { useToast } from '@/hooks/use-toast';
import { isSameWeek } from 'date-fns';

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
  { key: 'is_discipulado', label: 'É Discipulado' },
  { key: 'is_lider_em_treinamento', label: 'Líder em Treinamento' },
] as const;

export function CelulaDetailsDialog({ open, onOpenChange, celulaId, celulaName }: CelulaDetailsDialogProps) {
  const { toast } = useToast();
  const { data: members, isLoading: membersLoading } = useMembers(celulaId);
  const { data: casais, isLoading: casaisLoading } = useCasais(celulaId);
  const { data: reports, isLoading: reportsLoading } = useWeeklyReports(celulaId);
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const deleteCasal = useDeleteCasal();
  const createReport = useCreateWeeklyReport();
  const updateReport = useUpdateWeeklyReport();
  const deleteReport = useDeleteWeeklyReport();

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [casalDialogOpen, setCasalDialogOpen] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());

  // Report form state
  const weekStart = getCurrentWeekStart();
  const [meetingDate, setMeetingDate] = useState('');
  const [membersPresent, setMembersPresent] = useState(0);
  const [leadersInTraining, setLeadersInTraining] = useState(0);
  const [discipleships, setDiscipleships] = useState(0);
  const [visitors, setVisitors] = useState(0);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const isLoading = membersLoading || casaisLoading;

  const toggleExpanded = (memberId: string) => {
    setExpandedMembers(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  const handleMarcoChange = async (member: Member, marco: string, checked: boolean) => {
    await updateMember.mutateAsync({ id: member.id, [marco]: checked });
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Tem certeza que deseja remover este membro?')) {
      await removeMember.mutateAsync(memberId);
    }
  };

  const handleRemoveCasal = async (casalId: string) => {
    if (confirm('Tem certeza que deseja remover este vínculo de casal?')) {
      await deleteCasal.mutateAsync(casalId);
    }
  };

  const getMarcoCount = (member: Member) => {
    let count = 0;
    if (member.batismo) count++;
    if (member.encontro_com_deus) count++;
    if (member.renovo) count++;
    if (member.encontro_de_casais) count++;
    if (member.curso_lidere) count++;
    if (member.is_discipulado) count++;
    if (member.is_lider_em_treinamento) count++;
    return count;
  };

  const membersInCouples = new Set<string>();
  casais?.forEach(casal => {
    membersInCouples.add(casal.member1_id);
    membersInCouples.add(casal.member2_id);
  });
  const availableMembers = members?.filter(m => !membersInCouples.has(m.id)) || [];

  const membrosStats = {
    total: members?.length || 0,
    batismo: members?.filter(m => m.batismo).length || 0,
    encontro_com_deus: members?.filter(m => m.encontro_com_deus).length || 0,
    renovo: members?.filter(m => m.renovo).length || 0,
    encontro_de_casais: members?.filter(m => m.encontro_de_casais).length || 0,
    curso_lidere: members?.filter(m => m.curso_lidere).length || 0,
    is_discipulado: members?.filter(m => m.is_discipulado).length || 0,
    is_lider_em_treinamento: members?.filter(m => m.is_lider_em_treinamento).length || 0,
  };

  // Submit weekly report
  const handleSubmitReport = async () => {
    if (!meetingDate) {
      toast({ title: 'Informe a data da reunião', variant: 'destructive' });
      return;
    }
    try {
      await createReport.mutateAsync({
        celula_id: celulaId,
        week_start: weekStart,
        meeting_date: meetingDate,
        members_present: membersPresent,
        leaders_in_training: leadersInTraining,
        discipleships: discipleships,
        visitors: visitors,
        children: children,
        notes: notes || undefined,
        photo_url: photoUrl,
      });
      toast({ title: 'Relatório enviado com sucesso!' });
      // Reset form
      setMeetingDate('');
      setMembersPresent(0);
      setLeadersInTraining(0);
      setDiscipleships(0);
      setVisitors(0);
      setChildren(0);
      setNotes('');
      setPhotoUrl(null);
    } catch {
      toast({ title: 'Erro ao enviar relatório', variant: 'destructive' });
    }
  };

  // History edit handler - only current week
  const handleEditReport = (data: {
    id: string;
    members_present: number;
    leaders_in_training: number;
    discipleships: number;
    visitors: number;
    children: number;
    notes: string | null;
  }) => {
    const report = (reports || []).find(r => r.id === data.id);
    if (report) {
      const reportDate = new Date(report.meeting_date || report.week_start);
      if (!isSameWeek(reportDate, new Date(), { weekStartsOn: 1 })) {
        toast({ title: 'Ação não permitida', description: 'Você só pode editar relatórios da semana vigente', variant: 'destructive' });
        return;
      }
    }
    updateReport.mutate(data, {
      onSuccess: () => toast({ title: 'Relatório atualizado!' }),
      onError: () => toast({ title: 'Erro ao atualizar', variant: 'destructive' }),
    });
  };

  const handleDeleteReport = () => {
    toast({ title: 'Ação não permitida', description: 'Apenas coordenadores podem excluir relatórios', variant: 'destructive' });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {celulaName}
            </DialogTitle>
            <DialogDescription>
              Gerencie relatórios, membros e casais da célula
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="relatorio" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="relatorio" className="text-xs sm:text-sm">
                  <FileText className="h-4 w-4 mr-1 hidden sm:inline" />
                  Relatório
                </TabsTrigger>
                <TabsTrigger value="historico" className="text-xs sm:text-sm">
                  <History className="h-4 w-4 mr-1 hidden sm:inline" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="fotos" className="text-xs sm:text-sm">
                  <Image className="h-4 w-4 mr-1 hidden sm:inline" />
                  Fotos
                </TabsTrigger>
                <TabsTrigger value="membros" className="text-xs sm:text-sm">
                  Membros ({members?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="casais" className="text-xs sm:text-sm">
                  Casais ({casais?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* RELATÓRIO SEMANAL */}
              <TabsContent value="relatorio">
                <ScrollArea className="max-h-[60vh] pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Relatório Semanal
                      </CardTitle>
                      <CardDescription>Preencha o relatório da reunião desta semana</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Data da Reunião *</Label>
                        <Input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Membros Presentes</Label>
                          <Input type="number" min={0} value={membersPresent} onChange={(e) => setMembersPresent(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Líderes em Trein.</Label>
                          <Input type="number" min={0} value={leadersInTraining} onChange={(e) => setLeadersInTraining(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Discipulados</Label>
                          <Input type="number" min={0} value={discipleships} onChange={(e) => setDiscipleships(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Visitantes</Label>
                          <Input type="number" min={0} value={visitors} onChange={(e) => setVisitors(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Crianças</Label>
                          <Input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre a reunião..." />
                      </div>

                      <CelulaPhotoUpload
                        photoUrl={photoUrl}
                        onPhotoChange={setPhotoUrl}
                        celulaId={celulaId}
                        weekStart={weekStart}
                      />

                      <Button onClick={handleSubmitReport} disabled={createReport.isPending} className="w-full">
                        {createReport.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                        Enviar Relatório
                      </Button>
                    </CardContent>
                  </Card>
                </ScrollArea>
              </TabsContent>

              {/* HISTÓRICO */}
              <TabsContent value="historico">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Histórico de Relatórios
                    </CardTitle>
                    <CardDescription>Visualize e edite relatórios da semana vigente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reportsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ReportsHistoryTable
                        reports={reports || []}
                        onEdit={handleEditReport}
                        onDelete={handleDeleteReport}
                        isUpdating={updateReport.isPending}
                        isDeleting={false}
                        showCelulaColumn={false}
                        showCoordenacaoColumn={false}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FOTOS */}
              <TabsContent value="fotos">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Galeria de Fotos
                    </CardTitle>
                    <CardDescription>Fotos dos relatórios semanais</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CelulaPhotoGallery
                      reports={reports || []}
                      isLoading={reportsLoading}
                      showCelulaFilter={false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* MEMBROS */}
              <TabsContent value="membros" className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setMemberDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Membro
                  </Button>
                </div>
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-3">
                    {members?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum membro cadastrado. Clique em "Adicionar Membro" para começar.
                      </div>
                    ) : (
                      members?.map((member) => (
                        <Collapsible key={member.id} open={expandedMembers.has(member.id)} onOpenChange={() => toggleExpanded(member.id)}>
                          <div className="border rounded-lg p-3">
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                                    <AvatarFallback>{member.profile?.name?.charAt(0) || 'M'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{member.profile?.name || 'Sem nome'}</p>
                                    <p className="text-sm text-muted-foreground">{member.profile?.email || 'Sem email'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{getMarcoCount(member)}/7 marcos</Badge>
                                  {expandedMembers.has(member.id) ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4">
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground">Marcos Espirituais:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {MARCOS_ESPIRITUAIS.map(({ key, label }) => (
                                    <div key={key} className="flex items-center space-x-2">
                                      <Checkbox id={`${member.id}-${key}`} checked={member[key as keyof Member] as boolean} onCheckedChange={(checked) => handleMarcoChange(member, key, checked as boolean)} disabled={updateMember.isPending} />
                                      <label htmlFor={`${member.id}-${key}`} className="text-sm cursor-pointer">{label}</label>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-end pt-2">
                                  <Button variant="destructive" size="sm" onClick={() => handleRemoveMember(member.id)} disabled={removeMember.isPending}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* CASAIS */}
              <TabsContent value="casais" className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setCasalDialogOpen(true)} size="sm" disabled={availableMembers.length < 2}>
                    <Plus className="h-4 w-4 mr-2" />
                    Vincular Casal
                  </Button>
                </div>
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-3">
                    {casais?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>Nenhum casal vinculado ainda.</p>
                        {availableMembers.length >= 2 ? (
                          <p className="text-sm">Clique em "Vincular Casal" para começar.</p>
                        ) : (
                          <p className="text-sm">Adicione pelo menos 2 membros para vincular casais.</p>
                        )}
                      </div>
                    ) : (
                      casais?.map((casal) => (
                        <Card key={casal.id} className="bg-gradient-to-r from-primary/5 to-primary/10">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={casal.photo_url || undefined} />
                                  <AvatarFallback><Users2 className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={casal.member1?.profile?.avatar_url || undefined} />
                                    <AvatarFallback>{casal.member1?.profile?.name?.charAt(0) || 'M'}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{casal.member1?.profile?.name || 'Sem nome'}</span>
                                </div>
                                <Link2 className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={casal.member2?.profile?.avatar_url || undefined} />
                                    <AvatarFallback>{casal.member2?.profile?.name?.charAt(0) || 'M'}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{casal.member2?.profile?.name || 'Sem nome'}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveCasal(casal.id)} disabled={deleteCasal.isPending} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

      <MemberFormDialogSimple open={memberDialogOpen} onOpenChange={setMemberDialogOpen} celulaId={celulaId} />
      <CasalFormDialog open={casalDialogOpen} onOpenChange={setCasalDialogOpen} celulaId={celulaId} availableMembers={availableMembers} />
    </>
  );
}
