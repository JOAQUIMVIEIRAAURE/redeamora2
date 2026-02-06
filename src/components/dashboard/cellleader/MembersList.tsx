import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Member, useMembers, useUpdateMember, useRemoveMember } from '@/hooks/useMembers';
import { MemberFormDialogSimple } from './MemberFormDialogSimple';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MembersListProps {
  celulaId: string;
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

export function MembersList({ celulaId }: MembersListProps) {
  const { data: members, isLoading } = useMembers(celulaId);
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());

  const toggleExpanded = (memberId: string) => {
    setExpandedMembers(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const handleMarcoChange = async (member: Member, marco: string, checked: boolean) => {
    await updateMember.mutateAsync({
      id: member.id,
      [marco]: checked,
    });
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Tem certeza que deseja remover este membro?')) {
      await removeMember.mutateAsync(memberId);
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros da Célula
            </CardTitle>
            <CardDescription>
              {members?.length || 0} membros cadastrados
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {members?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum membro cadastrado ainda. Clique em "Adicionar Membro" para começar.
            </div>
          ) : (
            members?.map((member) => (
              <Collapsible
                key={member.id}
                open={expandedMembers.has(member.id)}
                onOpenChange={() => toggleExpanded(member.id)}
              >
                <div className="border rounded-lg p-3">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2">
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
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {getMarcoCount(member)}/7 marcos
                        </Badge>
                        {expandedMembers.has(member.id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="pt-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Marcos Espirituais:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {MARCOS_ESPIRITUAIS.map(({ key, label }) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${member.id}-${key}`}
                              checked={member[key as keyof Member] as boolean}
                              onCheckedChange={(checked) => 
                                handleMarcoChange(member, key, checked as boolean)
                              }
                              disabled={updateMember.isPending}
                            />
                            <label
                              htmlFor={`${member.id}-${key}`}
                              className="text-sm cursor-pointer"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removeMember.isPending}
                        >
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
        </CardContent>
      </Card>

      <MemberFormDialogSimple
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        celulaId={celulaId}
      />
    </>
  );
}
