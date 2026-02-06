import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { CellLeaderDashboard } from '@/components/dashboard/CellLeaderDashboard';
import { CoordinatorDashboard } from '@/components/dashboard/CoordinatorDashboard';
import { NetworkLeaderDashboard } from '@/components/dashboard/NetworkLeaderDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { isLoading, isAdmin, isRedeLeader, isCoordenador, isCelulaLeader, roles } = useAuth();
  
  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Render dashboard based on user role (priority: admin > rede_leader > coordenador > celula_leader)
  const renderDashboard = () => {
    if (isAdmin) {
      return <AdminDashboard />;
    }
    if (isRedeLeader) {
      return <NetworkLeaderDashboard />;
    }
    if (isCoordenador) {
      return <CoordinatorDashboard />;
    }
    // Default to cell leader dashboard (or for users without specific roles)
    return <CellLeaderDashboard />;
  };

  return (
    <AppLayout title="Dashboard">
      {renderDashboard()}
    </AppLayout>
  );
}
