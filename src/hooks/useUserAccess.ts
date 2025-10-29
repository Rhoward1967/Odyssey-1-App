import { useEffect, useState } from 'react';

export type UserRole = 'user' | 'manager' | 'admin';

export interface UserAccess {
  role: UserRole;
  permissions: string[];
  canAccess: (requiredRole?: UserRole) => boolean;
}

export const useUserAccess = (): UserAccess => {
  const [role, setRole] = useState<UserRole>('user');

  useEffect(() => {
    // For now, default to 'user' role
    // In production, this would check authentication/database
    const storedRole = localStorage.getItem('userRole') as UserRole;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const getRolePermissions = (userRole: UserRole): string[] => {
    switch (userRole) {
      case 'admin':
        return ['read', 'write', 'delete', 'admin', 'manage_users', 'view_hr', 'manage_schedule'];
      case 'manager':
        return ['read', 'write', 'view_hr', 'manage_schedule', 'view_reports'];
      case 'user':
      default:
        return ['read', 'trading', 'profile'];
    }
  };

  const canAccess = (requiredRole?: UserRole): boolean => {
    if (!requiredRole) return true;
    
    const roleHierarchy: Record<UserRole, number> = {
      'user': 1,
      'manager': 2,
      'admin': 3
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  return {
    role,
    permissions: getRolePermissions(role),
    canAccess
  };
};

// Helper function to set user role (for testing/demo purposes)
export const setUserRole = (newRole: UserRole): void => {
  localStorage.setItem('userRole', newRole);
  window.location.reload(); // Refresh to apply new role
};