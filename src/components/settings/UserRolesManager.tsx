import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Shield, Network, FolderTree, Home, ClipboardCheck, UserPlus, Users, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCoordenacoes } from '@/hooks/useCoordenacoes';
import { useSupervisores, useCreateSupervisor, useDeleteSupervisor } from '@/hooks/useSupervisoes';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: 'Admin', icon: <Shield className="h-3 w-3" />, color: 'bg-destructive text-destructive-foreground' },
  rede_leader: { label: 'Líder de Rede', icon: <Network className="h-3 w-3" />, color: 'bg-primary text-primary-foreground' },
  coordenador: { label: 'Coordenador', icon: <FolderTree className="h-3 w-3" />, color: 'bg-accent text-accent-foreground' },
  supervisor: { label: 'Supervisor', icon: <ClipboardCheck className="h-3 w-3" />, color: 'bg-secondary text-secondary-foreground' },
  celula_leader: { label: 'Líder de Célula', icon: <Home className="h-3 w-3" />, color: 'bg-muted text-muted-foreground' },
};

const allRoles: AppRole[] = ['admin', 'rede_leader', 'coordenador', 'supervisor', 'celula_leader'];

interface Profile {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  user_id: string;
}

interface ProfileWithRoles extends Profile {
  roles: AppRole[];
}

export function UserRolesManager() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [selectedProfileForSupervisor, setSelectedProfileForSupervisor] = useState<string>('');
  const [selectedCoordenacao, setSelectedCoordenacao] = useState<string>('');
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, AppRole[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all profiles with their roles
  const { data: profilesWithRoles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;

      // Map roles to profiles by user_id
      const rolesByUserId: Record<string, AppRole[]> = {};
      userRoles?.forEach(ur => {
        if (!rolesByUserId[ur.user_id]) {
          rolesByUserId[ur.user_id] = [];
        }
        rolesByUserId[ur.user_id].push(ur.role as AppRole);
      });

      return (profiles || []).map(profile => ({
        ...profile,
        roles: rolesByUserId[profile.user_id] || [],
      })) as ProfileWithRoles[];
    },
  });

  const { data: coordenacoes } = useCoordenacoes();
  const { data: supervisores, isLoading: supervisoresLoading } = useSupervisores();
  const createSupervisor = useCreateSupervisor();
  const deleteSupervisor = useDeleteSupervisor();

  // Create profile mutation
  const createProfile = useMutation({
    mutationFn: async (data: { name: string; email?: string }) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          name: data.name,
          email: data.email || null,
          user_id: crypto.randomUUID(),
        })
        .select()
        .single();
      if (error) throw error;
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles-with-roles'] });
      toast({ title: 'Sucesso!', description: 'Perfil criado com sucesso.' });
      setNewProfileName('');
      setNewProfileEmail('');
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  // Delete profile mutation
  const deleteProfile = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['supervisores'] });
      toast({ title: 'Sucesso!', description: 'Perfil removido com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    createProfile.mutate({ name: newProfileName, email: newProfileEmail });
  };

  // Get current roles for a profile (considering pending changes)
  const getCurrentRoles = (profile: ProfileWithRoles): AppRole[] => {
    return pendingRoleChanges[profile.user_id] ?? profile.roles;
  };

  // Toggle a role for a profile
  const toggleRole = (profile: ProfileWithRoles, role: AppRole) => {
    const currentRoles = getCurrentRoles(profile);
    let newRoles: AppRole[];
    
    if (currentRoles.includes(role)) {
      newRoles = currentRoles.filter(r => r !== role);
    } else {
      newRoles = [...currentRoles, role];
    }
    
    setPendingRoleChanges(prev => ({
      ...prev,
      [profile.user_id]: newRoles,
    }));
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.keys(pendingRoleChanges).length > 0;

  // Save all role changes
  const saveRoleChanges = async () => {
    setIsSaving(true);
    try {
      for (const [userId, newRoles] of Object.entries(pendingRoleChanges)) {
        const profile = profilesWithRoles?.find(p => p.user_id === userId);
        if (!profile) continue;

        const oldRoles = profile.roles;
        
        // Roles to add
        const rolesToAdd = newRoles.filter(r => !oldRoles.includes(r));
        // Roles to remove
        const rolesToRemove = oldRoles.filter(r => !newRoles.includes(r));

        // Add new roles
        for (const role of rolesToAdd) {
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role });
          if (error) throw error;
        }

        // Remove old roles
        for (const role of rolesToRemove) {
          const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', role);
          if (error) throw error;
        }
      }

      setPendingRoleChanges({});
      queryClient.invalidateQueries({ queryKey: ['profiles-with-roles'] });
      toast({ title: 'Sucesso!', description: 'Papéis atualizados com sucesso.' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel pending changes
  const cancelChanges = () => {
    setPendingRoleChanges({});
  };

  const handleAddSupervisor = async () => {
    if (!selectedProfileForSupervisor || !selectedCoordenacao) return;
    
    const exists = supervisores?.some(
      s => s.profile_id === selectedProfileForSupervisor && s.coordenacao_id === selectedCoordenacao
    );
    
    if (exists) {
      toast({
        title: 'Aviso',
        description: 'Este perfil já é supervisor desta coordenação.',
        variant: 'destructive',
      });
      return;
    }

    await createSupervisor.mutateAsync({
      profile_id: selectedProfileForSupervisor,
      coordenacao_id: selectedCoordenacao,
    });
    
    setSelectedProfileForSupervisor('');
    setSelectedCoordenacao('');
  };

  if (profilesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Perfis e Papéis
          </TabsTrigger>
          <TabsTrigger value="supervisores" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Supervisores
          </TabsTrigger>
        </TabsList>

        {/* Profiles & Roles Tab */}
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestão de Perfis e Papéis
                  </CardTitle>
                  <CardDescription>
                    Cadastre perfis e atribua papéis (Admin, Líder de Rede, Coordenador, Supervisor, Líder de Célula)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <>
                      <Button variant="outline" onClick={cancelChanges}>
                        Cancelar
                      </Button>
                      <Button onClick={saveRoleChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Perfil
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasUnsavedChanges && (
                <div className="mb-4 p-3 bg-secondary border border-border rounded-lg text-secondary-foreground text-sm">
                  ⚠️ Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perfil</TableHead>
                    {allRoles.map(role => (
                      <TableHead key={role} className="text-center w-28">
                        <div className="flex flex-col items-center gap-1">
                          {roleLabels[role].icon}
                          <span className="text-xs">{roleLabels[role].label}</span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profilesWithRoles?.map((profile) => {
                    const currentRoles = getCurrentRoles(profile);
                    const hasChanges = pendingRoleChanges[profile.user_id] !== undefined;
                    
                    return (
                      <TableRow key={profile.id} className={hasChanges ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {profile.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{profile.name}</span>
                              {profile.email && (
                                <p className="text-xs text-muted-foreground">{profile.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        {allRoles.map(role => (
                          <TableCell key={role} className="text-center">
                            <Checkbox
                              checked={currentRoles.includes(role)}
                              onCheckedChange={() => toggleRole(profile, role)}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Remover perfil "${profile.name}"?`)) {
                                deleteProfile.mutate(profile.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!profilesWithRoles || profilesWithRoles.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={allRoles.length + 2} className="text-center text-muted-foreground py-8">
                        Nenhum perfil cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supervisores Tab */}
        <TabsContent value="supervisores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Gestão de Supervisores
              </CardTitle>
              <CardDescription>
                Vincule perfis como supervisores de coordenações específicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Supervisor Form */}
              <Card className="bg-muted/50">
                <CardContent className="py-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Perfil</Label>
                      <Select value={selectedProfileForSupervisor} onValueChange={setSelectedProfileForSupervisor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          {profilesWithRoles?.map(profile => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Coordenação</Label>
                      <Select value={selectedCoordenacao} onValueChange={setSelectedCoordenacao}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma coordenação" />
                        </SelectTrigger>
                        <SelectContent>
                          {coordenacoes?.map(coord => (
                            <SelectItem key={coord.id} value={coord.id}>
                              {coord.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleAddSupervisor}
                        disabled={!selectedProfileForSupervisor || !selectedCoordenacao || createSupervisor.isPending}
                        className="w-full"
                      >
                        {createSupervisor.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Supervisor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supervisors List */}
              {supervisoresLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Coordenação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supervisores?.map((supervisor) => (
                      <TableRow key={supervisor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {supervisor.profile?.name?.charAt(0).toUpperCase() || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{supervisor.profile?.name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {supervisor.coordenacao?.name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Remover este supervisor?')) {
                                deleteSupervisor.mutate(supervisor.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!supervisores || supervisores.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          Nenhum supervisor cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Profile Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Perfil</DialogTitle>
            <DialogDescription>
              Cadastre um novo perfil para atribuir papéis no sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={newProfileEmail}
                onChange={(e) => setNewProfileEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateProfile} 
                disabled={!newProfileName.trim() || createProfile.isPending}
              >
                {createProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Perfil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
