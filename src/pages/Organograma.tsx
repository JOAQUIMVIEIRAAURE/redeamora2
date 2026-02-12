import { useState } from 'react';
import { Loader2, GitBranch, Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useOrganograma } from '@/hooks/useOrganograma';
import { OrgNodeComponent } from '@/components/organograma/OrgNode';

export default function Organograma() {
  const { tree, isLoading } = useOrganograma();
  const [search, setSearch] = useState('');

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Organograma"
          subtitle="Estrutura hierárquica da rede"
          icon={GitBranch}
        />

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome (coordenação, supervisor, célula, casal)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tree.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhuma rede cadastrada.
          </div>
        ) : (
          <div className="space-y-2">
            {tree.map(node => (
              <OrgNodeComponent key={node.id} node={node} level={0} searchQuery={search} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
