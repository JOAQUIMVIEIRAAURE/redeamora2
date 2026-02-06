import { useState } from 'react';
import { useUsersWithRoles, useAddUserRole, useRemoveUserRole } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, X, Shield, Network, FolderTree, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: 'Admin', icon: <Shield className="h-3 w-3" />, color: 'bg-red-500 text-white' },
  rede_leader: { label: 'Líder de Rede', icon: <Network className="h-3 w-3" />, color: 'bg-blue-500 text-white' },
  coordenador: { label: 'Coordenador', icon: <FolderTree className="h-3 w-3" />, color: 'bg-green-500 text-white' },
  celula_leader: { label: 'Líder de Célula', icon: <Home className="h-3 w-3" />, color: 'bg-orange-500 text-white' },
};

const allRoles: AppRole[] = ['admin', 'rede_leader', 'coordenador', 'celula_leader'];

export function UserRolesManager() {
  const { data: users, isLoading } = useUsersWithRoles();
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();
  const [selectedRole, setSelectedRole] = useState<Record<string, AppRole | ''>>({});

  const handleAddRole = async (userId: string, userRoles: AppRole[]) => {
    const role = selectedRole[userId];
    if (!role) return;

    if (userRoles.includes(role)) {
      toast({
        title: 'Papel já existe',
        description: 'Este usuário já possui este papel.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addRole.mutateAsync({ userId, role });
      setSelectedRole(prev => ({ ...prev, [userId]: '' }));
      toast({
        title: 'Papel adicionado',
        description: `Papel ${roleLabels[role].label} adicionado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o papel.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    try {
      await removeRole.mutateAsync({ userId, role });
      toast({
        title: 'Papel removido',
        description: `Papel ${roleLabels[role].label} removido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o papel.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gestão de Papéis de Usuários
        </CardTitle>
        <CardDescription>
          Atribua papéis aos usuários para definir suas permissões no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Papéis Atuais</TableHead>
              <TableHead>Adicionar Papel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge
                          key={role}
                          className={`${roleLabels[role].color} flex items-center gap-1 cursor-pointer hover:opacity-80`}
                          onClick={() => handleRemoveRole(user.user_id, role)}
                        >
                          {roleLabels[role].icon}
                          {roleLabels[role].label}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Sem papéis</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedRole[user.user_id] || ''}
                      onValueChange={(value) => 
                        setSelectedRole(prev => ({ ...prev, [user.user_id]: value as AppRole }))
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allRoles
                          .filter(role => !user.roles.includes(role))
                          .map((role) => (
                            <SelectItem key={role} value={role}>
                              <span className="flex items-center gap-2">
                                {roleLabels[role].icon}
                                {roleLabels[role].label}
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => handleAddRole(user.user_id, user.roles)}
                      disabled={!selectedRole[user.user_id] || addRole.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
