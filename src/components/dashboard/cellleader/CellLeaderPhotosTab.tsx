import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from 'lucide-react';
import type { WeeklyReport } from '@/hooks/useWeeklyReports';
import { CelulaPhotoGallery } from '../CelulaPhotoGallery';

interface CellLeaderPhotosTabProps {
  reports: WeeklyReport[];
  isLoading?: boolean;
}

export function CellLeaderPhotosTab({ reports, isLoading }: CellLeaderPhotosTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Galeria de Fotos da Célula
        </CardTitle>
        <CardDescription>
          Fotos salvas nos relatórios semanais da célula selecionada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CelulaPhotoGallery
          reports={reports}
          isLoading={isLoading}
          showCelulaFilter={false}
        />
      </CardContent>
    </Card>
  );
}
