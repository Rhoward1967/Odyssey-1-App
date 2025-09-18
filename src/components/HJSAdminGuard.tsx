import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Settings } from 'lucide-react';

interface HJSAdminGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export const HJSAdminGuard: React.FC<HJSAdminGuardProps> = ({ 
  children, 
  requiredPermission = 'BASIC_ACCESS',
  fallback 
}) => {
  const { user, isHJSAdmin } = useApp();

  // Core 3 always have access
  if (user?.canNeverBeLocked) {
    return <>{children}</>;
  }

  // Check HJS admin status
  if (!isHJSAdmin && requiredPermission !== 'BASIC_ACCESS') {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <CardTitle className="text-red-600">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            This area requires HJS administrative privileges.
          </p>
          <Badge variant="outline" className="text-xs">
            Contact: christlahoward63@gmail.com
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export const AdminStatusBadge: React.FC = () => {
  const { user, isHJSAdmin } = useApp();

  if (!user) return null;

  const getRoleIcon = () => {
    switch (user.role) {
      case 'CEO': return <Crown className="w-4 h-4" />;
      case 'ARCHITECT': return <Settings className="w-4 h-4" />;
      case 'VP_OPERATIONS': return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getRoleColor = () => {
    if (user.canNeverBeLocked) return 'bg-gradient-to-r from-purple-500 to-blue-500';
    if (isHJSAdmin) return 'bg-gradient-to-r from-blue-500 to-green-500';
    return 'bg-gray-500';
  };

  return (
    <Badge className={`${getRoleColor()} text-white flex items-center gap-1`}>
      {getRoleIcon()}
      {user.role.replace('_', ' ')}
      {user.canNeverBeLocked && ' ∞'}
    </Badge>
  );
};