import { Celula } from '@/hooks/useCelulas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Users, MapPin, Calendar, Heart } from 'lucide-react';
import { getCoupleDisplayName } from '@/hooks/useLeadershipCouples';

interface CelulaCardProps {
  celula: Celula;
  onEdit: (celula: Celula) => void;
  onDelete: (celula: Celula) => void;
}

export function CelulaCard({ celula, onEdit, onDelete }: CelulaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{celula.name}</CardTitle>
          {celula.coordenacao && (
            <Badge variant="secondary" className="text-xs">
              {celula.coordenacao.name}
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(celula)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(celula)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {celula.leadership_couple ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span>{getCoupleDisplayName(celula.leadership_couple)}</span>
          </div>
        ) : celula.leader ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{celula.leader.name}</span>
          </div>
        ) : null}
        
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{celula._count?.members || 0} membros</span>
          </div>
          
          {celula.meeting_day && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{celula.meeting_day}</span>
              {celula.meeting_time && <span>às {celula.meeting_time}</span>}
            </div>
          )}
        </div>
        
        {celula.address && (
          <div className="flex items-start gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{celula.address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
