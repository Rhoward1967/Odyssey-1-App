import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Collaborator {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  accepted_at?: string;
}

export const useCollaboration = (bidId: string) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);

  const inviteCollaborator = async (email: string, role: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: { action: 'invite', bidId, email, role }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: { action: 'accept', bidId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPermissions = async (role: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: { action: 'permissions', role }
      });
      
      if (error) throw error;
      return data.permissions;
    } catch (error) {
      console.error('Error getting permissions:', error);
      return { read: true, write: false, delete: false };
    }
  };

  return {
    collaborators,
    loading,
    inviteCollaborator,
    acceptInvitation,
    getPermissions
  };
};