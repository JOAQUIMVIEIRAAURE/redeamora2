import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Users, UserCheck, Heart, UserPlus, Baby, Save, Loader2, ClipboardList, Users2, CalendarIcon } from 'lucide-react';
import { useCelulas } from '@/hooks/useCelulas';
import { useWeeklyReports, useCreateWeeklyReport } from '@/hooks/useWeeklyReports';
import { useToast } from '@/hooks/use-toast';
import { DateRangeSelector, DateRangeValue, getDateString } from './DateRangeSelector';
import { MembersList } from './cellleader/MembersList';
import { CasaisManager } from './cellleader/CasaisManager';
import { BirthdayAlert } from './BirthdayAlert';
import { CelulaPhotoUpload } from './cellleader/CelulaPhotoUpload';
import { format, subDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function CellLeaderDashboard() {
  const { toast } = useToast();
  const { data: celulas, isLoading: celulasLoading } = useCelulas();
  const createReport = useCreateWeeklyReport();
  
  const [selectedCelula, setSelectedCelula] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: subDays(new Date(), 6),
    to: new Date()
  });
  const [meetingDate, setMeetingDate] = useState<Date>(new Date());
  
  const dateRangeFilter = {
    from: getDateString(dateRange.from),
    to: getDateString(dateRange.to)
  };
  
  const { data: existingReports } = useWeeklyReports(selectedCelula, dateRangeFilter);
  
  const [formData, setFormData] = useState({
    members_present: 0,
    leaders_in_training: 0,
    discipleships: 0,
    visitors: 0,
    children: 0,
    notes: '',
    photo_url: null as string | null,
  });

  // Get week start from meeting date for database compatibility
  const weekStart = getDateString(startOfWeek(meetingDate, { weekStartsOn: 1 }));
  const meetingDateString = getDateString(meetingDate);

  // Update form when celula or meeting date changes
  useEffect(() => {
    if (selectedCelula && existingReports) {
      const report = existingReports.find(r => 
        r.celula_id === selectedCelula && 
        (r.meeting_date === meetingDateString || r.week_start === weekStart)
      );
      if (report) {
        setFormData({
          members_present: report.members_present,
          leaders_in_training: report.leaders_in_training,
          discipleships: report.discipleships,
          visitors: report.visitors,
          children: report.children,
          notes: report.notes || '',
          photo_url: report.photo_url || null,
        });
        if (report.meeting_date) {
          setMeetingDate(new Date(report.meeting_date));
        }
      } else {
        setFormData({
          members_present: 0,
          leaders_in_training: 0,
          discipleships: 0,
          visitors: 0,
          children: 0,
          notes: '',
          photo_url: null,
        });
      }
    }
  }, [selectedCelula, meetingDateString, weekStart, existingReports]);

  const handleCelulaChange = (celulaId: string) => {
    setSelectedCelula(celulaId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCelula) {
      toast({
        title: 'Erro',
        description: 'Selecione uma célula',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createReport.mutateAsync({
        celula_id: selectedCelula,
        week_start: weekStart,
        meeting_date: meetingDateString,
        ...formData,
      });
      
      toast({
        title: 'Sucesso!',
        description: 'Relatório semanal salvo com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar relatório',
        variant: 'destructive',
      });
    }
  };

  // Show all celulas in controlled environment
  const userCelulas = celulas || [];

  const statCards = [
    { icon: Users, label: 'Membros Presentes', key: 'members_present', color: 'text-primary' },
    { icon: UserCheck, label: 'Líderes em Treinamento', key: 'leaders_in_training', color: 'text-primary' },
    { icon: Heart, label: 'Discipulados', key: 'discipleships', color: 'text-primary' },
    { icon: UserPlus, label: 'Visitantes', key: 'visitors', color: 'text-primary' },
    { icon: Baby, label: 'Crianças', key: 'children', color: 'text-primary' },
  ];

  if (celulasLoading) {
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
          <h2 className="text-2xl font-bold text-foreground">Gestão da Célula</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecione sua Célula</CardTitle>
          <CardDescription>Escolha a célula para gerenciar</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCelula} onValueChange={handleCelulaChange}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Selecione uma célula" />
            </SelectTrigger>
            <SelectContent>
              {userCelulas.map(celula => (
                <SelectItem key={celula.id} value={celula.id}>
                  {celula.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCelula ? (
        <Tabs defaultValue="relatorio" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="relatorio" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Relatório</span>
            </TabsTrigger>
            <TabsTrigger value="membros" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Membros</span>
            </TabsTrigger>
            <TabsTrigger value="casais" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              <span className="hidden sm:inline">Casais</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="relatorio" className="space-y-4">
            {/* Birthday Alert */}
            <BirthdayAlert celulaId={selectedCelula} />
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Meeting Date Picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Data da Célula:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(meetingDate, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={meetingDate}
                      onSelect={(date) => date && setMeetingDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      locale={ptBR}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Date Range Filter for history */}
              <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {statCards.map(({ icon: Icon, label, key, color }) => (
                  <Card key={key}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {label}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </CardHeader>
                    <CardContent>
                      <Input
                        type="number"
                        min="0"
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [key]: parseInt(e.target.value) || 0
                        }))}
                        className="text-2xl font-bold h-12"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Observações e Foto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Adicione observações sobre a reunião..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                  
                  <CelulaPhotoUpload
                    photoUrl={formData.photo_url}
                    onPhotoChange={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
                    celulaId={selectedCelula}
                    weekStart={weekStart}
                  />
                  
                  <Button type="submit" className="w-full" disabled={createReport.isPending}>
                    {createReport.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Relatório
                  </Button>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="membros">
            <MembersList celulaId={selectedCelula} />
          </TabsContent>

          <TabsContent value="casais">
            <CasaisManager celulaId={selectedCelula} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecione uma célula</h3>
            <p className="text-muted-foreground mt-1">
              Escolha sua célula acima para gerenciar membros, casais e relatórios
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
