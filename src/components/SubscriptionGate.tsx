import React from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Star, Zap } from 'lucide-react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredTier?: 'trial' | 'basic' | 'pro' | 'enterprise';
  feature?: string;
  fallback?: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  requiredTier = 'trial',
  feature = 'this feature',
  fallback
}) => {
  const { user } = useAuth();

  const tierHierarchy = {
    trial: 0,
    basic: 1,
    pro: 2,
    enterprise: 3
  };

  const userTier = user?.subscription_tier || 'public';
  const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || -1;
  const requiredTierLevel = tierHierarchy[requiredTier];

  const hasAccess = userTierLevel >= requiredTierLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Star className="w-5 h-5" />;
      case 'pro': return <Zap className="w-5 h-5" />;
      case 'enterprise': return <Crown className="w-5 h-5" />;
      default: return <Lock className="w-5 h-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-500';
      case 'pro': return 'bg-purple-500';
      case 'enterprise': return 'bg-gold-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className={`w-16 h-16 ${getTierColor(requiredTier)} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {getTierIcon(requiredTier)}
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          Upgrade Required
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          Access to {feature} requires a{' '}
          <Badge variant="outline" className="capitalize">
            {requiredTier}
          </Badge>{' '}
          subscription or higher.
        </p>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Current: <Badge variant="secondary" className="capitalize">{userTier}</Badge>
          </p>
          <p className="text-sm text-gray-500">
            Required: <Badge variant="default" className="capitalize">{requiredTier}</Badge>
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={() => window.location.href = '/subscription'}>
            Upgrade Now
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};