import { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'rede_leader' | 'coordenador' | 'supervisor' | 'celula_leader';

interface RoleContextType {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole | null) => void;
  isAdmin: boolean;
  isRedeLeader: boolean;
  isCoordenador: boolean;
  isSupervisor: boolean;
  isCelulaLeader: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const value: RoleContextType = {
    selectedRole,
    setSelectedRole,
    isAdmin: selectedRole === 'admin',
    isRedeLeader: selectedRole === 'rede_leader',
    isCoordenador: selectedRole === 'coordenador',
    isSupervisor: selectedRole === 'supervisor',
    isCelulaLeader: selectedRole === 'celula_leader',
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
