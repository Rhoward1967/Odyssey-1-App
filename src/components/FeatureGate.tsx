import React from 'react';
import { useRealtimeAdmin } from '@/hooks/useRealtimeAdmin';

interface FeatureGateProps {
  feature: string;
  userType?: 'trial' | 'subscriber' | 'public';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  userType = 'public', 
  children, 
  fallback = null 
}) => {
  const { featureToggles } = useRealtimeAdmin();

  const featureToggle = featureToggles.find(toggle => toggle.feature_name === feature);
  
  if (!featureToggle || !featureToggle.is_enabled) {
    return <>{fallback}</>;
  }

  if (!featureToggle.user_types.includes(userType) && userType !== 'public') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};