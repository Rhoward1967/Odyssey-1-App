import { supabase } from './supabase';

// Approved emails for HJS Services LLC
const APPROVED_HJS_EMAILS = [
  'rhoward@hjsservices.us',
  'a.r.barnett11@gmail.com'  // Ahmad Barnett - VP
];

export async function sendMagicLink(email: string) {
  const normalized = email.trim().toLowerCase();
  
  if (!APPROVED_HJS_EMAILS.includes(normalized)) {
    throw new Error('Email not authorized for this organization');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (error) throw error;
  
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
    console.error('Organization not found:', orgError);
    return { success: false, error: 'Organization not found' };
  }

  // Determine role (VP gets admin)
  const role = normalized === 'a.r.barnett11@gmail.com' ? 'admin' : 'member';

  // Insert into user_organizations
  const { error: assignError } = await supabase
    .from('user_organizations')
    .insert({
      user_id: userId,
      organization_id: org.id,
      role: role
    });

  if (assignError) {
    console.error('Failed to assign user to org:', assignError);
    return { success: false, error: assignError.message };
  }

  return { success: true };
}