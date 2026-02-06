import { Navigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
}

export function RoleProtectedRoute({ children }: RoleProtectedRouteProps) {
  const { selectedRole } = useRole();
  
  if (!selectedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
