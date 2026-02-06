import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/contexts/RoleContext';
import { CellLeaderDashboard } from '@/components/dashboard/CellLeaderDashboard';
import { CoordinatorDashboard } from '@/components/dashboard/CoordinatorDashboard';
import { NetworkLeaderDashboard } from '@/components/dashboard/NetworkLeaderDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { isAdmin, isRedeLeader, isCoordenador } = useRole();

  // Render dashboard based on selected role
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
    // Default to cell leader dashboard
    return <CellLeaderDashboard />;
  };

  return (
    <AppLayout title="Dashboard">
      {renderDashboard()}
    </AppLayout>
  );
}
