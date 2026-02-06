import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function Configuracoes() {
  const { profile, roles, isAdmin, isRedeLeader, isCoordenador, isCelulaLeader } = useAuth();

  const getRoleBadges = () => {
    const badges = [];
    if (isAdmin) badges.push({ label: 'Admin', variant: 'default' as const });
    if (isRedeLeader) badges.push({ label: 'Líder de Rede', variant: 'secondary' as const });
    if (isCoordenador) badges.push({ label: 'Coordenador', variant: 'secondary' as const });
    if (isCelulaLeader) badges.push({ label: 'Líder de Célula', variant: 'outline' as const });
    return badges;
  };

  return (
    <AppLayout title="Configurações">
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Perfil do Usuário</CardTitle>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-sm">{profile?.name || 'Não informado'}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{profile?.email || 'Não informado'}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Papéis</label>
              <div className="flex flex-wrap gap-2">
                {getRoleBadges().length > 0 ? (
                  getRoleBadges().map((badge) => (
                    <Badge key={badge.label} variant={badge.variant}>
                      {badge.label}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Nenhum papel atribuído</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Opções disponíveis apenas para administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Configurações adicionais serão exibidas aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
