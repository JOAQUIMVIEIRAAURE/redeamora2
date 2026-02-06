import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { useMeeting, useMeetingAttendances, useSaveAttendances } from '@/hooks/useMeetings';
import { useMembers } from '@/hooks/useMembers';

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string | null;
}

export function AttendanceDialog({ open, onOpenChange, meetingId }: AttendanceDialogProps) {
  const { data: meeting, isLoading: meetingLoading } = useMeeting(meetingId || undefined);
  const { data: attendances, isLoading: attendancesLoading } = useMeetingAttendances(meetingId || undefined);
  const { data: members, isLoading: membersLoading } = useMembers(meeting?.celula_id);
  const saveAttendances = useSaveAttendances();
  
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  
  // Initialize present IDs from existing attendances
  useEffect(() => {
    if (attendances) {
      const ids = new Set(
        attendances
          .filter(a => a.present)
          .map(a => a.member_id)
      );
      setPresentIds(ids);
    }
  }, [attendances]);
  
  const isLoading = meetingLoading || attendancesLoading || membersLoading;
  
  function togglePresent(memberId: string) {
    setPresentIds(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  }
  
  async function handleSave() {
    if (!meetingId || !members) return;
    
    const attendanceData = members.map(m => ({
      member_id: m.id,
      present: presentIds.has(m.id),
    }));
    
    await saveAttendances.mutateAsync({
      meetingId,
      attendances: attendanceData,
    });
    
    onOpenChange(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Registrar Presença</DialogTitle>
          {meeting && (
            <p className="text-sm text-muted-foreground">
              {meeting.celula?.name} - {new Date(meeting.date).toLocaleDateString('pt-BR')}
            </p>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Esta célula não possui membros cadastrados.
            </p>
          ) : (
            <div className="space-y-3">
              {members?.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => togglePresent(member.id)}
                >
                  <Checkbox 
                    checked={presentIds.has(member.id)}
                    onCheckedChange={() => togglePresent(member.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profile?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1">{member.profile?.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saveAttendances.isPending}>
            {saveAttendances.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              `Salvar (${presentIds.size} presentes)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
