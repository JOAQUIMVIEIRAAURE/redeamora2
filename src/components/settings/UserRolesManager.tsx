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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Shield, Network, FolderTree, Home, ClipboardCheck, UserPlus, Users } from 'lucide-react';
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

export function UserRolesManager() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [selectedProfileForRole, setSelectedProfileForRole] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [selectedProfileForSupervisor, setSelectedProfileForSupervisor] = useState<string>('');
  const [selectedCoordenacao, setSelectedCoordenacao] = useState<string>('');

  // Fetch all profiles
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Profile[];
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
          user_id: crypto.randomUUID(), // Generate a random UUID for the user_id
        })
        .select()
        .single();
      if (error) throw error;
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
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
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
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

  const handleAddSupervisor = async () => {
    if (!selectedProfileForSupervisor || !selectedCoordenacao) return;
    
    // Check if already exists
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
            Perfis
          </TabsTrigger>
          <TabsTrigger value="supervisores" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Supervisores
          </TabsTrigger>
        </TabsList>

        {/* Profiles Tab */}
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestão de Perfis
                  </CardTitle>
                  <CardDescription>
                    Cadastre perfis para líderes, coordenadores e supervisores
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Perfil
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles?.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {profile.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{profile.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {profile.email || '-'}
                      </TableCell>
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
                  ))}
                  {(!profiles || profiles.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
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
                          {profiles?.map(profile => (
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
