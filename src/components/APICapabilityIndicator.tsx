import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import { apiManager } from '@/lib/api/api-manager';

interface APICapabilityIndicatorProps {
  capability: string;
  requiredFor: string;
}

export default function APICapabilityIndicator({ capability, requiredFor }: APICapabilityIndicatorProps) {
  const hasCapability = apiManager.hasCapability(capability);
  
  return (
    <Badge 
      variant={hasCapability ? 'default' : 'secondary'}
      className="flex items-center gap-1"
    >
      {hasCapability ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      <span>{capability}</span>
      {hasCapability && <Zap className="w-3 h-3 text-yellow-500" />}
    </Badge>
  );
}
