import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users2, Plus, Loader2, Trash2, Link2, Heart } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useCasais, useDeleteCasal, useUpdateCasal } from '@/hooks/useCasais';
import { CasalFormDialog } from './CasalFormDialog';
import { CasalPhotoUpload } from './CasalPhotoUpload';

interface CasaisManagerProps {
  celulaId: string;
}

export function CasaisManager({ celulaId }: CasaisManagerProps) {
  const { data: members } = useMembers(celulaId);
  const { data: casais, isLoading } = useCasais(celulaId);
  const deleteCasal = useDeleteCasal();
  const updateCasal = useUpdateCasal();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRemoveCasal = async (casalId: string) => {
    if (confirm('Tem certeza que deseja remover este vínculo de casal?')) {
      await deleteCasal.mutateAsync(casalId);
    }
  };

  const handlePhotoChange = async (casalId: string, photoUrl: string | null) => {
    await updateCasal.mutateAsync({ id: casalId, photo_url: photoUrl });
  };

  // Get members that are already in a couple
  const membersInCouples = new Set<string>();
  casais?.forEach(casal => {
    membersInCouples.add(casal.member1_id);
    membersInCouples.add(casal.member2_id);
  });

  // Filter available members (not in a couple yet)
  const availableMembers = members?.filter(m => !membersInCouples.has(m.id)) || [];

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
              <Users2 className="h-5 w-5 text-primary" />
              Casais da Célula
            </CardTitle>
            <CardDescription>
              {casais?.length || 0} casais vinculados
            </CardDescription>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            disabled={availableMembers.length < 2}
          >
            <Plus className="h-4 w-4 mr-2" />
            Vincular Casal
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {casais?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Nenhum casal vinculado ainda.</p>
              {availableMembers.length >= 2 ? (
                <p className="text-sm">Clique em "Vincular Casal" para começar.</p>
              ) : (
                <p className="text-sm">Adicione pelo menos 2 membros para vincular casais.</p>
              )}
            </div>
          ) : (
            casais?.map((casal) => (
              <div
                key={casal.id}
                className="border rounded-lg p-4 flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10"
              >
                <div className="flex items-center gap-4">
                  {/* Casal Photo */}
                  <CasalPhotoUpload
                    casalId={casal.id}
                    currentPhotoUrl={casal.photo_url}
                    onPhotoChange={(url) => handlePhotoChange(casal.id, url)}
                    isUpdating={updateCasal.isPending}
                  />

                  {/* Member 1 */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={casal.member1?.profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {casal.member1?.profile?.name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {casal.member1?.profile?.name || 'Sem nome'}
                    </span>
                  </div>

                  <Link2 className="h-4 w-4 text-primary/50" />

                  {/* Member 2 */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={casal.member2?.profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {casal.member2?.profile?.name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {casal.member2?.profile?.name || 'Sem nome'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCasal(casal.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <CasalFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        celulaId={celulaId}
        availableMembers={availableMembers}
      />
    </>
  );
}
