import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  FolderTree,
  Home,
  ClipboardCheck,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const mainNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
  const { profile, signOut, isAdmin, isRedeLeader } = useAuth();

  const showAdminItems = isAdmin || isRedeLeader;

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
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name} />
            <AvatarFallback>
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {profile?.name || 'Usuário'}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {profile?.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-8 w-8 shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
