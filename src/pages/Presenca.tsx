import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2, Calendar, Users, UserPlus } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { useCelulas } from '@/hooks/useCelulas';
import { MeetingFormDialog } from '@/components/meetings/MeetingFormDialog';
import { AttendanceDialog } from '@/components/meetings/AttendanceDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Presenca() {
  const [selectedCelula, setSelectedCelula] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [attendanceMeetingId, setAttendanceMeetingId] = useState<string | null>(null);
  
  const { data: celulas } = useCelulas();
  const { data: meetings, isLoading } = useMeetings(
    selectedCelula !== 'all' ? selectedCelula : undefined
  );
  
  return (
    <AppLayout title="Controle de Presença">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Select value={selectedCelula} onValueChange={setSelectedCelula}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Filtrar por célula" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as células</SelectItem>
              {celulas?.map((celula) => (
                <SelectItem key={celula.id} value={celula.id}>
                  {celula.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Reunião
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reuniões</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : meetings?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma reunião registrada ainda. Clique em "Nova Reunião" para começar.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Célula</TableHead>
                    <TableHead>Presenças</TableHead>
                    <TableHead>Visitantes</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings?.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(meeting.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{meeting.celula?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {meeting._count?.attendances || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          {meeting._count?.visitors || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAttendanceMeetingId(meeting.id)}
                        >
                          Registrar Presença
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      <MeetingFormDialog 
        open={formOpen} 
        onOpenChange={setFormOpen}
        preselectedCelulaId={selectedCelula !== 'all' ? selectedCelula : undefined}
      />
      
      <AttendanceDialog
        open={!!attendanceMeetingId}
        onOpenChange={(open) => !open && setAttendanceMeetingId(null)}
        meetingId={attendanceMeetingId}
      />
    </AppLayout>
  );
}
