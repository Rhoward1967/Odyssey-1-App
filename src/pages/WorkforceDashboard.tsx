import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useState } from 'react';
import WorkforceManagementSystem from '../components/WorkspaceManager';

/**
 * WorkforceDashboard Page
 * 
 * UPDATED: Now uses the unified WorkspaceManager component
 * OLD: Used to show Gemini-designed mock-up (removed)
 */

const WorkforceDashboard: React.FC = () => {
  const [userId, setUserId] = useState<string>('00000000-0000-0000-0000-000000000000');
  const organizationId = 1;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  return (
    <div className="p-6">
      <WorkforceManagementSystem organizationId={organizationId} userId={userId} />
    </div>
  );
};

export default WorkforceDashboard;
