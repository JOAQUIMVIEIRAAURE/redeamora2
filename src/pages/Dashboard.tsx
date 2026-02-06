import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Home, ClipboardCheck, TrendingUp } from 'lucide-react';

const stats = [
  {
    title: 'Total de Membros',
    value: '0',
    description: 'Membros ativos no sistema',
    icon: Users,
  },
  {
    title: 'Células Ativas',
    value: '0',
    description: 'Células em funcionamento',
    icon: Home,
  },
  {
    title: 'Taxa de Presença',
    value: '0%',
    description: 'Média de frequência',
    icon: ClipboardCheck,
  },
  {
    title: 'Crescimento',
    value: '0%',
    description: 'Últimos 30 dias',
    icon: TrendingUp,
  },
];

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder for charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Membros</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Gráfico de evolução será exibido aqui
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Presença por Célula</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Gráfico de presença será exibido aqui
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhuma atividade recente para exibir
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
