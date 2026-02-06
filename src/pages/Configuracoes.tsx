import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRolesManager } from '@/components/settings/UserRolesManager';
import { WeeklyReportsHistory } from '@/components/reports/WeeklyReportsHistory';
import { User, Shield, History } from 'lucide-react';

export default function Configuracoes() {
  const { profile, isAdmin, isRedeLeader, isCoordenador, isCelulaLeader } = useAuth();

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
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Meu Perfil
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Gestão de Papéis
            </TabsTrigger>
          )}
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico de Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="max-w-2xl">
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
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="roles">
            <UserRolesManager />
          </TabsContent>
        )}

        <TabsContent value="history">
          <WeeklyReportsHistory />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
