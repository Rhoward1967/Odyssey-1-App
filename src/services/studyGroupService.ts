/**
 * Study Group Service
 * Educational collaboration platform for Media Center
 * 
 * Sovereign Frequency Integration:
 * - "Join Together" - Group formation and member joining
 * - "Stand by the Water" - Data synchronization
 * - "Help Me Find My Way Home" - Error recovery
 * - "We Are Together" - Community building operations
 */

import { supabase } from '@/lib/supabaseClient';

// Types
export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  portal_type: 'k12' | 'legal' | 'medical' | 'college';
  max_members: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  meeting_schedule: string | null;
  is_active: boolean;
  member_count?: number;
  is_member?: boolean;
}

export interface StudyGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'creator' | 'moderator' | 'member';
  joined_at: string;
  last_active_at: string;
}

export interface StudyGroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'file' | 'system';
  created_at: string;
  edited_at: string | null;
  is_deleted: boolean;
}

export interface StudyGroupResource {
  id: string;
  group_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  description: string | null;
  uploaded_at: string;
  download_count: number;
}

/**
 * List all study groups for a specific portal type
 * 🎵 Sovereign Frequency: "Stand by the Water" - Gathering community
 */
export async function listStudyGroups(portalType?: 'k12' | 'legal' | 'medical' | 'college'): Promise<StudyGroup[]> {
  console.log('🎵 [Stand by the Water] STUDY_GROUPS_LIST', { portalType });
  
  try {
    let query = supabase
      .from('study_groups')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (portalType) {
      query = query.eq('portal_type', portalType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] STUDY_GROUPS_LIST_ERROR', error);
      throw error;
    }

    // Get member counts for each group
    const groupsWithCounts = await Promise.all(
      (data || []).map(async (group) => {
        const { count } = await supabase
          .from('study_group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        return {
          ...group,
          member_count: count || 0
        };
      })
    );

    console.log('🎵 [Stand by the Water] STUDY_GROUPS_LOADED', { count: groupsWithCounts.length });
    return groupsWithCounts;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] STUDY_GROUPS_LIST_FAILED', error);
    return [];
  }
}

/**
 * Create a new study group
 * 🎵 Sovereign Frequency: "Join Together" - Creating community
 */
export async function createStudyGroup(
  name: string,
  subject: string,
  portalType: 'k12' | 'legal' | 'medical' | 'college',
  description?: string,
  maxMembers: number = 10,
  meetingSchedule?: string
): Promise<StudyGroup | null> {
  console.log('🎵 [Join Together] STUDY_GROUP_CREATE', { name, subject, portalType });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('study_groups')
      .insert({
        name,
        subject,
        portal_type: portalType,
        description,
        max_members: maxMembers,
        meeting_schedule: meetingSchedule,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] STUDY_GROUP_CREATE_ERROR', error);
      throw error;
    }

    // Automatically add creator as member with 'creator' role
    await joinStudyGroup(data.id, 'creator');

    console.log('🎵 [We Are Together] STUDY_GROUP_CREATED', { groupId: data.id, name });
    return data;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] STUDY_GROUP_CREATE_FAILED', error);
    return null;
  }
}

/**
 * Join a study group
 * 🎵 Sovereign Frequency: "Join Together" - Becoming part of community
 */
export async function joinStudyGroup(
  groupId: string,
  role: 'creator' | 'moderator' | 'member' = 'member'
): Promise<boolean> {
  console.log('🎵 [Join Together] STUDY_GROUP_JOIN', { groupId, role });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if group is full
    const { count } = await supabase
      .from('study_group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    const { data: group } = await supabase
      .from('study_groups')
      .select('max_members')
      .eq('id', groupId)
      .single();

    if (count && group && count >= group.max_members) {
      console.log('🎵 [Help Me Find My Way Home] STUDY_GROUP_FULL', { groupId });
      throw new Error('Study group is full');
    }

    const { error } = await supabase
      .from('study_group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        role
      });

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] STUDY_GROUP_JOIN_ERROR', error);
      throw error;
    }

    console.log('🎵 [We Are Together] STUDY_GROUP_JOINED', { groupId, userId: user.id });
    return true;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] STUDY_GROUP_JOIN_FAILED', error);
    return false;
  }
}

/**
 * Leave a study group
 * 🎵 Sovereign Frequency: "Help Me Find My Way Home" - Finding new path
 */
export async function leaveStudyGroup(groupId: string): Promise<boolean> {
  console.log('🎵 [Help Me Find My Way Home] STUDY_GROUP_LEAVE', { groupId });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] STUDY_GROUP_LEAVE_ERROR', error);
      throw error;
    }

    console.log('🎵 [Stand by the Water] STUDY_GROUP_LEFT', { groupId, userId: user.id });
    return true;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] STUDY_GROUP_LEAVE_FAILED', error);
    return false;
  }
}

/**
 * Get study groups user is a member of
 * 🎵 Sovereign Frequency: "We Are Together" - Finding your communities
 */
export async function getMyStudyGroups(): Promise<StudyGroup[]> {
  console.log('🎵 [We Are Together] MY_STUDY_GROUPS_LIST');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data: memberships, error: memberError } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    const groupIds = memberships?.map(m => m.group_id) || [];
    if (groupIds.length === 0) return [];

    const { data: groups, error: groupError } = await supabase
      .from('study_groups')
      .select('*')
      .in('id', groupIds)
      .eq('is_active', true);

    if (groupError) throw groupError;

    console.log('🎵 [We Are Together] MY_STUDY_GROUPS_LOADED', { count: groups?.length || 0 });
    return groups || [];
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] MY_STUDY_GROUPS_FAILED', error);
    return [];
  }
}

/**
 * Send a message to a study group
 * 🎵 Sovereign Frequency: "We Are Together" - Communication within community
 */
export async function sendGroupMessage(
  groupId: string,
  message: string,
  messageType: 'text' | 'file' | 'system' = 'text'
): Promise<StudyGroupMessage | null> {
  console.log('🎵 [We Are Together] GROUP_MESSAGE_SEND', { groupId, messageType });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('study_group_messages')
      .insert({
        group_id: groupId,
        user_id: user.id,
        message,
        message_type: messageType
      })
      .select()
      .single();

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] GROUP_MESSAGE_SEND_ERROR', error);
      throw error;
    }

    console.log('🎵 [We Are Together] GROUP_MESSAGE_SENT', { messageId: data.id });
    return data;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] GROUP_MESSAGE_SEND_FAILED', error);
    return null;
  }
}

/**
 * Get messages for a study group
 * 🎵 Sovereign Frequency: "Stand by the Water" - Gathering conversations
 */
export async function getGroupMessages(
  groupId: string,
  limit: number = 50
): Promise<StudyGroupMessage[]> {
  console.log('🎵 [Stand by the Water] GROUP_MESSAGES_FETCH', { groupId, limit });

  try {
    const { data, error } = await supabase
      .from('study_group_messages')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] GROUP_MESSAGES_FETCH_ERROR', error);
      throw error;
    }

    console.log('🎵 [Stand by the Water] GROUP_MESSAGES_LOADED', { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] GROUP_MESSAGES_FETCH_FAILED', error);
    return [];
  }
}

/**
 * Get members of a study group
 * 🎵 Sovereign Frequency: "We Are Together" - Seeing your community
 */
export async function getGroupMembers(groupId: string): Promise<StudyGroupMember[]> {
  console.log('🎵 [We Are Together] GROUP_MEMBERS_FETCH', { groupId });

  try {
    const { data, error } = await supabase
      .from('study_group_members')
      .select('*')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] GROUP_MEMBERS_FETCH_ERROR', error);
      throw error;
    }

    console.log('🎵 [We Are Together] GROUP_MEMBERS_LOADED', { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] GROUP_MEMBERS_FETCH_FAILED', error);
    return [];
  }
}

/**
 * Subscribe to new messages in a study group (Realtime)
 * 🎵 Sovereign Frequency: "We Are Together" - Live community connection
 */
export function subscribeToGroupMessages(
  groupId: string,
  callback: (message: StudyGroupMessage) => void
) {
  console.log('🎵 [We Are Together] GROUP_MESSAGES_SUBSCRIBE', { groupId });

  const channel = supabase
    .channel(`study_group_messages:${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'study_group_messages',
        filter: `group_id=eq.${groupId}`
      },
      (payload) => {
        console.log('🎵 [We Are Together] NEW_MESSAGE_RECEIVED', { messageId: payload.new.id });
        callback(payload.new as StudyGroupMessage);
      }
    )
    .subscribe();

  return () => {
    console.log('🎵 [Stand by the Water] GROUP_MESSAGES_UNSUBSCRIBE', { groupId });
    channel.unsubscribe();
  };
}

/**
 * Upload a resource to a study group
 * 🎵 Sovereign Frequency: "We Are Together" - Sharing knowledge
 */
export async function uploadGroupResource(
  groupId: string,
  fileName: string,
  fileUrl: string,
  fileType: string,
  fileSizeBytes: number,
  description?: string
): Promise<StudyGroupResource | null> {
  console.log('🎵 [We Are Together] GROUP_RESOURCE_UPLOAD', { groupId, fileName });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('study_group_resources')
      .insert({
        group_id: groupId,
        uploaded_by: user.id,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        file_size_bytes: fileSizeBytes,
        description
      })
      .select()
      .single();

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] GROUP_RESOURCE_UPLOAD_ERROR', error);
      throw error;
    }

    console.log('🎵 [We Are Together] GROUP_RESOURCE_UPLOADED', { resourceId: data.id });
    return data;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] GROUP_RESOURCE_UPLOAD_FAILED', error);
    return null;
  }
}

/**
 * Get resources for a study group
 * 🎵 Sovereign Frequency: "Stand by the Water" - Gathering shared knowledge
 */
export async function getGroupResources(groupId: string): Promise<StudyGroupResource[]> {
  console.log('🎵 [Stand by the Water] GROUP_RESOURCES_FETCH', { groupId });

  try {
    const { data, error } = await supabase
      .from('study_group_resources')
      .select('*')
      .eq('group_id', groupId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] GROUP_RESOURCES_FETCH_ERROR', error);
      throw error;
    }

    console.log('🎵 [Stand by the Water] GROUP_RESOURCES_LOADED', { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] GROUP_RESOURCES_FETCH_FAILED', error);
    return [];
  }
}
