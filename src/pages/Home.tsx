import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, FolderTree, Network, Shield, ClipboardCheck, Lock, Heart } from 'lucide-react';
import logoAnoSantidade from '@/assets/logo-ano-santidade.png';
import { AccessCodeDialog } from '@/components/access/AccessCodeDialog';
import { ACCESS_CODES, requiresAccessCode, type RoleType } from '@/config/accessCodes';

const roleOptions: Array<{
  role: RoleType;
  title: string;
  description: string;
  icon: typeof HomeIcon;
}> = [
{
  role: 'celula_leader',
  title: 'Líder de Célula',
  description: 'Gerencie sua célula, registre presenças e envie relatórios semanais.',
  icon: HomeIcon
},
{
  role: 'supervisor',
  title: 'Supervisor',
  description: 'Registre supervisões e acompanhe o desempenho das células.',
  icon: ClipboardCheck
},
{
  role: 'coordenador',
  title: 'Coordenador',
  description: 'Visualize métricas da coordenação e gerencie líderes.',
  icon: FolderTree
},
{
  role: 'rede_leader',
  title: 'Líder de Rede',
  description: 'Acompanhe métricas consolidadas por coordenação e exporte dados.',
  icon: Network
},
{
  role: 'admin',
  title: 'Administrador',
  description: 'Acesso total: redes, coordenações, células, membros e usuários.',
  icon: Shield
}];


export default function HomePage() {
  const navigate = useNavigate();
  const { setSelectedRole } = useRole();
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [selectedRoleForAccess, setSelectedRoleForAccess] = useState<RoleType | null>(null);

  const handleRoleSelect = (role: RoleType) => {
    if (requiresAccessCode(role)) {
      setSelectedRoleForAccess(role);
      setAccessDialogOpen(true);
    } else {
      setSelectedRole(role);
      navigate('/dashboard');
    }
  };

  const handleAccessSuccess = () => {
    if (selectedRoleForAccess) {
      setSelectedRole(selectedRoleForAccess);
      navigate('/dashboard');
    }
  };

  const selectedRoleTitle = selectedRoleForAccess ?
  roleOptions.find((r) => r.role === selectedRoleForAccess)?.title || '' :
  '';

  const selectedRoleCode = selectedRoleForAccess ?
  ACCESS_CODES[selectedRoleForAccess] || '' :
  '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <img src={logoAnoSantidade} alt="Igreja do Amor – Ano da Santidade 2026" className="h-32 w-auto object-contain" />
          </div>
          <p className="text-muted-foreground mt-1 text-lg tracking-wide">Rede Amor a 2</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleOptions.map((option) => {const IconComponent = option.icon;const needsCode = requiresAccessCode(option.role);

              return (
                <Card
                  key={option.role}
                  className="cursor-pointer card-hover group"
                  onClick={() => handleRoleSelect(option.role)}>

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <IconComponent className="h-5 w-5 text-accent-foreground group-hover:text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      {needsCode &&
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Requer código de acesso" />
                        }
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {option.description}
                  </CardDescription>
                  <Button
                      variant={needsCode ? "outline" : "default"}
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleSelect(option.role);
                      }}>

                    {needsCode ?
                      <span className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5" />
                        Acessar
                      </span> :

                      'Acessar'
                      }
                  </Button>
                </CardContent>
              </Card>);

            })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          🔒 Áreas administrativas protegidas por código de acesso
        </p>
      </div>

      <AccessCodeDialog
        open={accessDialogOpen}
        onOpenChange={setAccessDialogOpen}
        roleTitle={selectedRoleTitle}
        onSuccess={handleAccessSuccess}
        accessCode={selectedRoleCode} />

    </div>);

}