import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image as ImageIcon, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WeeklyReport } from '@/hooks/useWeeklyReports';
import { useCelulas } from '@/hooks/useCelulas';

interface CelulaPhotoGalleryProps {
  reports: WeeklyReport[];
  isLoading?: boolean;
  showCelulaFilter?: boolean;
}

export function CelulaPhotoGallery({ reports, isLoading, showCelulaFilter = true }: CelulaPhotoGalleryProps) {
  const { data: celulas } = useCelulas();
  const [selectedCelula, setSelectedCelula] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<WeeklyReport | null>(null);

  // Filter reports that have photos
  const reportsWithPhotos = reports.filter(r => r.photo_url);
  
  // Apply celula filter
  const filteredReports = selectedCelula === 'all' 
    ? reportsWithPhotos 
    : reportsWithPhotos.filter(r => r.celula_id === selectedCelula);

  // Group by month
  const groupedByMonth = filteredReports.reduce((acc, report) => {
    const monthKey = format(new Date(report.week_start), 'MMMM yyyy', { locale: ptBR });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(report);
    return acc;
  }, {} as Record<string, WeeklyReport[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCelulaFilter && (
        <div className="flex items-center gap-4">
          <Select value={selectedCelula} onValueChange={setSelectedCelula}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filtrar por célula" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as células</SelectItem>
              {celulas?.map(celula => (
                <SelectItem key={celula.id} value={celula.id}>
                  {celula.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Badge variant="secondary">
            {filteredReports.length} foto{filteredReports.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {filteredReports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma foto encontrada</h3>
            <p className="text-muted-foreground mt-1">
              As fotos das células aparecerão aqui quando os líderes as enviarem
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByMonth).map(([month, monthReports]) => (
          <div key={month} className="space-y-4">
            <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {month}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {monthReports.map(report => (
                <Card 
                  key={report.id} 
                  className="overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                  onClick={() => setSelectedPhoto(report)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={report.photo_url!}
                      alt={`Célula ${report.celula?.name}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-medium truncate">
                        {report.celula?.name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {format(new Date(report.week_start), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedPhoto?.celula?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.photo_url!}
                alt={`Célula ${selectedPhoto.celula?.name}`}
                className="w-full rounded-lg"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(selectedPhoto.week_start), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Badge>
                <Badge variant="secondary">
                  {selectedPhoto.members_present} membros presentes
                </Badge>
                <Badge variant="secondary">
                  {selectedPhoto.visitors} visitantes
                </Badge>
              </div>
              
              {selectedPhoto.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{selectedPhoto.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
