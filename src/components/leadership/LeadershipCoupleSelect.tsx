import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLeadershipCouples, useCreateLeadershipCouple, getCoupleDisplayName } from '@/hooks/useLeadershipCouples';
import { useProfiles } from '@/hooks/useProfiles';
import { Plus, Users } from 'lucide-react';

interface LeadershipCoupleSelectProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
}

export function LeadershipCoupleSelect({ 
  value, 
  onChange, 
  label = 'Casal de Liderança',
  placeholder = 'Selecione um casal'
}: LeadershipCoupleSelectProps) {
  const { data: couples } = useLeadershipCouples();
  const { data: profiles } = useProfiles();
  const createCouple = useCreateLeadershipCouple();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [spouse1Id, setSpouse1Id] = useState('');
  const [spouse2Id, setSpouse2Id] = useState('');

  async function handleCreateCouple() {
    if (!spouse1Id || !spouse2Id) return;
    
    try {
      const newCouple = await createCouple.mutateAsync({
        spouse1_id: spouse1Id,
        spouse2_id: spouse2Id,
      });
      onChange(newCouple.id);
      setDialogOpen(false);
      setSpouse1Id('');
      setSpouse2Id('');
    } catch {
      // Error handled by mutation
    }
  }

  // Filter profiles for spouse2 (exclude spouse1)
  const availableForSpouse2 = profiles?.filter(p => p.id !== spouse1Id) || [];

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Select 
          value={value || 'no_couple_selected'} 
          onValueChange={(v) => onChange(v === 'no_couple_selected' ? null : v)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder}>
              {value && couples?.find(c => c.id === value) 
                ? getCoupleDisplayName(couples.find(c => c.id === value))
                : (value === null ? "Nenhum" : placeholder)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no_couple_selected">Nenhum</SelectItem>
            {couples?.map((couple) => (
              <SelectItem key={couple.id} value={couple.id}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {getCoupleDisplayName(couple)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon" title="Criar novo casal">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Casal de Liderança</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Primeiro Cônjuge</Label>
                <Select value={spouse1Id} onValueChange={setSpouse1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o primeiro cônjuge" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Segundo Cônjuge</Label>
                <Select value={spouse2Id} onValueChange={setSpouse2Id} disabled={!spouse1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segundo cônjuge" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForSpouse2.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCreateCouple}
                  disabled={!spouse1Id || !spouse2Id || createCouple.isPending}
                >
                  Criar Casal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
