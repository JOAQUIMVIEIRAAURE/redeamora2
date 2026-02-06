import { useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, FolderTree, Network, Shield, ClipboardCheck } from 'lucide-react';

type RoleType = 'admin' | 'rede_leader' | 'coordenador' | 'supervisor' | 'celula_leader';

const roleOptions: Array<{
  role: RoleType;
  title: string;
  description: string;
  icon: typeof HomeIcon;
  colorClass: string;
}> = [
  {
    role: 'celula_leader',
    title: 'Líder de Célula',
    description: 'Acesse o dashboard para gerenciar sua célula, registrar presenças e enviar relatórios semanais.',
    icon: HomeIcon,
    colorClass: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    role: 'supervisor',
    title: 'Supervisor',
    description: 'Registre supervisões de células, avalie o roteiro e acompanhe o desempenho das células.',
    icon: ClipboardCheck,
    colorClass: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    role: 'coordenador',
    title: 'Coordenador',
    description: 'Visualize as células da sua coordenação, acompanhe métricas e gerencie líderes.',
    icon: FolderTree,
    colorClass: 'bg-green-500 hover:bg-green-600',
  },
  {
    role: 'rede_leader',
    title: 'Líder de Rede',
    description: 'Acompanhe métricas consolidadas por coordenação e exporte dados da rede.',
    icon: Network,
    colorClass: 'bg-primary hover:bg-primary/90',
  },
  {
    role: 'admin',
    title: 'Administrador',
    description: 'Acesso total ao sistema: gerencie redes, coordenações, células, membros e usuários.',
    icon: Shield,
    colorClass: 'bg-destructive hover:bg-destructive/90',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { setSelectedRole } = useRole();

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-3xl">
              ❤️
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Rede Amor a 2</h1>
          <p className="text-muted-foreground">Sistema de Gestão de Células</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card 
                key={option.role} 
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleRoleSelect(option.role)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${option.colorClass} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {option.description}
                  </CardDescription>
                  <Button 
                    className={`w-full mt-4 ${option.colorClass} text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect(option.role);
                    }}
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Ambiente controlado - Selecione seu papel para acessar o sistema
        </p>
      </div>
    </div>
  );
}
