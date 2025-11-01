import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

interface TrialBannerProps {
  onUpgradeClick?: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ onUpgradeClick }) => {
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number;
    isActive: boolean;
    hasExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const checkTrialStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const trialStartDate = user.user_metadata?.trial_start_date;
      const subscriptionStatus = user.user_metadata?.subscription_status;

      if (!trialStartDate) {
        // No trial info - set it now
        const { error } = await supabase.auth.updateUser({
          data: {
            trial_start_date: new Date().toISOString(),
            trial_days: 7,
            subscription_status: 'trial'
          }
        });

        if (!error) {
          setTrialInfo({ daysRemaining: 7, isActive: true, hasExpired: false });
        }
        return;
      }

      // Calculate days remaining
      const startDate = new Date(trialStartDate);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 7 - daysPassed);

      setTrialInfo({
        daysRemaining,
        isActive: subscriptionStatus === 'trial' || subscriptionStatus === 'active',
        hasExpired: daysRemaining === 0 && subscriptionStatus === 'trial'
      });
    };

    checkTrialStatus();
  }, []);

  if (!trialInfo) return null;

  // Don't show banner if subscribed
  if (trialInfo.isActive && !trialInfo.hasExpired && trialInfo.daysRemaining < 7) {
    return (
      <Alert className="bg-blue-900/30 border-blue-500 mb-4">
        <Clock className="h-4 w-4 text-blue-400" />
        <AlertTitle className="text-blue-300">
          Free Trial Active - {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? 'day' : 'days'} remaining
        </AlertTitle>
        <AlertDescription className="text-blue-200 flex items-center justify-between">
          <span>Enjoying ODYSSEY-1? Upgrade now for uninterrupted access to all features.</span>
          <Button 
            onClick={onUpgradeClick} 
            className="bg-blue-600 hover:bg-blue-700 ml-4"
            size="sm"
          >
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial expired
  if (trialInfo.hasExpired) {
    return (
      <Alert className="bg-red-900/30 border-red-500 mb-4">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertTitle className="text-red-300">Trial Expired</AlertTitle>
        <AlertDescription className="text-red-200 flex items-center justify-between">
          <span>Your 7-day free trial has ended. Subscribe to continue using ODYSSEY-1.</span>
          <Button 
            onClick={onUpgradeClick} 
            className="bg-red-600 hover:bg-red-700 ml-4"
            size="sm"
          >
            Subscribe Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
