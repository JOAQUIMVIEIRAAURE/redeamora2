import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  FolderTree,
  Home,
  ClipboardCheck,
  Settings,
  LogOut,
  Database
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  rede_leader: 'Líder de Rede',
  coordenador: 'Coordenador',
  celula_leader: 'Líder de Célula',
};

// Items only for cell leader - just dashboard (no Dados)
const cellLeaderNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

// Nav items for coordinator and above (includes Dados)
const fullNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Dados', href: '/dados', icon: Database },
  { title: 'Células', href: '/celulas', icon: Home },
  { title: 'Membros', href: '/membros', icon: Users },
  { title: 'Presença', href: '/presenca', icon: ClipboardCheck },
];

const adminNavItems = [
  { title: 'Redes', href: '/redes', icon: Network },
  { title: 'Coordenações', href: '/coordenacoes', icon: FolderTree },
  { title: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedRole, setSelectedRole, isAdmin, isRedeLeader, isCoordenador, isSupervisor, isCelulaLeader } = useRole();

  const showAdminItems = isAdmin || isRedeLeader;
  
  // Cell leader and supervisor only see Dashboard; coordinators and above see full menu
  const mainNavItems = (isCelulaLeader || isSupervisor) && !isCoordenador && !isRedeLeader && !isAdmin 
    ? cellLeaderNavItems 
    : fullNavItems;

  const handleLogout = () => {
    setSelectedRole(null);
    navigate('/');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            ❤️
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">Rede Amor a 2</span>
            <span className="text-xs text-sidebar-foreground/70">Sistema de Células</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <NavLink to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdminItems && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                      <NavLink to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {selectedRole?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {selectedRole ? roleLabels[selectedRole] : 'Usuário'}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Ambiente controlado
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 shrink-0"
            title="Voltar à seleção de papel"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
