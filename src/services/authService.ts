import { sfLogger } from './sovereignFrequencyLogger';
import { supabase } from '@/lib/supabaseClient';

// Approved emails for HJS Services LLC
const APPROVED_HJS_EMAILS = [
  'rhoward@hjsservices.us',
  'a.r.barnett11@gmail.com'  // Ahmad Barnett - VP
];

export async function sendMagicLink(email: string) {
  const normalized = email.trim().toLowerCase();
  
  if (!APPROVED_HJS_EMAILS.includes(normalized)) {
    sfLogger.security('AUTH_DENIED', 'Unauthorized email attempt blocked', { email: normalized });
    throw new Error('Email not authorized for this organization');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (error) {
    sfLogger.helpMeFindMyWayHome('AUTH_RECOVERY', 'Magic link delivery failed, retrying', { email: normalized, error: error.message });
    throw error;
  }
  
  sfLogger.everyday('AUTH_ROUTINE', 'Magic link sent successfully', { email: normalized });
  return { success: true };
}

// Auto-assign user to HJS Services LLC after signup
export async function assignUserToOrganization(userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  
  // Only assign if email is approved
  if (!APPROVED_HJS_EMAILS.includes(normalized)) {
    return { success: false, error: 'Email not approved' };
  }

  // Get HJS Services LLC organization ID
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .ilike('name', '%HJS Services%')
    .single();

  if (orgError || !org) {
    sfLogger.helpMeFindMyWayHome('ORG_LOOKUP_FAILED', 'Organization not found, cannot complete user assignment', { userId, error: orgError });
    console.error('Organization not found:', orgError);
    return { success: false, error: 'Organization not found' };
  }

  // Determine role (VP gets admin)
  const role = normalized === 'a.r.barnett11@gmail.com' ? 'admin' : 'member';

  sfLogger.whenYouLoveSomebody('USER_ASSIGNMENT', 'Allocating user to organization with appropriate role', { userId, orgId: org.id, role });

  // Insert into user_organizations
  const { error: assignError } = await supabase
    .from('user_organizations')
    .insert({
      user_id: userId,
      organization_id: org.id,
      role: role
    });

  if (assignError) {
    sfLogger.helpMeFindMyWayHome('ORG_ASSIGNMENT_FAILED', 'Failed to assign user to organization', { userId, error: assignError.message });
    console.error('Failed to assign user to org:', assignError);
    return { success: false, error: assignError.message };
  }

  sfLogger.thanksForGivingBackMyLove('USER_ONBOARDING_COMPLETE', 'User successfully assigned to organization', { userId, orgId: org.id, role });
  return { success: true };
}