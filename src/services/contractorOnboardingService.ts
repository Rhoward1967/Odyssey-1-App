import { supabase } from '../lib/supabaseClient';

/**
 * 🛰️ CONTRACTOR ONBOARDING TOKEN GENERATOR
 * Purpose: Generate secure unique tokens for contractor self-service onboarding
 * Security: UUID v4 tokens stored in contractors.onboarding_token
 * Usage: Call generateContractorOnboardingToken() to create invite link
 */

interface TokenGenerationResult {
  success: boolean;
  token?: string;
  inviteUrl?: string;
  emailId?: string;
  error?: string;
}

/**
 * Generate a unique onboarding token for a contractor and send invitation email
 * 
 * @param contractorName - Legal full name of contractor
 * @param contractorEmail - Email address for contractor
 * @param flatRateCents - Default flat rate in cents (default: 26200 = $262.00)
 * @param autoSendEmail - Automatically send invitation email (default: true)
 * @returns Token, invite URL, and email ID
 */
export async function generateContractorOnboardingToken(
  contractorName: string,
  contractorEmail: string,
  flatRateCents: number = 26200,
  autoSendEmail: boolean = true
): Promise<TokenGenerationResult> {
  try {
    // Generate UUID v4 token
    const token = crypto.randomUUID();

    // Create contractor record with pending status
    const { data, error } = await supabase
      .from('contractors')
      .insert([
        {
          full_name: contractorName,
          email: contractorEmail,
          flat_rate_cents: flatRateCents,
          onboarding_token: token,
          onboarding_status: 'pending',
          email_delivery_status: 'not_sent',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Token generation error:', error);
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }

    // Generate invite URL (adjust domain for production)
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/onboarding/contractor/${token}`;

    // Auto-send invitation email if enabled
    let emailId: string | undefined;
    if (autoSendEmail && contractorEmail) {
      const emailResult = await sendContractorInvitation(contractorName, contractorEmail, inviteUrl);
      
      if (emailResult.success && emailResult.emailId) {
        emailId = emailResult.emailId;
        
        // Update contractor record with email tracking
        await supabase
          .from('contractors')
          .update({
            invite_sent_at: new Date().toISOString(),
            invite_email_id: emailId,
            email_delivery_status: 'sent'
          })
          .eq('id', data.id);
        
        console.log(`✅ Invitation sent and tracked for ${contractorName} (Email ID: ${emailId})`);
      } else {
        console.warn(`⚠️ Email send failed for ${contractorName}:`, emailResult.error);
      }
    }

    return {
      success: true,
      token,
      inviteUrl,
      emailId
    };
  } catch (err) {
    console.error('Unexpected error generating token:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Send contractor onboarding invitation email
 * 
 * @param contractorName - Contractor's name
 * @param contractorEmail - Contractor's email
 * @param inviteUrl - Generated invite URL
 * @returns Success status
 */
export async function sendContractorInvitation(
  contractorName: string,
  contractorEmail: string,
  inviteUrl: string
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const { generateContractorInviteEmail } = await import('./contractorEmailTemplates');
    const { subject, html, text } = generateContractorInviteEmail(contractorName, inviteUrl);

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: contractorEmail,
        subject,
        html,
        textContent: text
      }
    });

    if (error) {
      console.error('❌ Failed to send contractor invitation:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Contractor invitation sent to ${contractorEmail} (ID: ${data.emailId})`);
    return { success: true, emailId: data.emailId };
  } catch (err) {
    console.error('❌ Contractor invitation error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Validate if a token is still active and not yet used
 * 
 * @param token - UUID token to validate
 * @returns Validation result
 */
export async function validateOnboardingToken(
  token: string
): Promise<{ valid: boolean; contractor?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('onboarding_token', token)
      .single();

    if (error || !data) {
      return {
        valid: false,
        error: 'Invalid or expired token'
      };
    }

    // Check if already completed
    if (data.onboarding_status === 'submitted' || data.onboarding_status === 'approved') {
      return {
        valid: false,
        error: 'Onboarding already completed for this token'
      };
    }

    return {
      valid: true,
      contractor: data
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * List all pending contractor onboardings
 * 
 * @returns List of contractors awaiting submission
 */
export async function getPendingOnboardings(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('onboarding_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending onboardings:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

/**
 * List all submitted contractor onboardings awaiting approval
 * 
 * @returns List of contractors awaiting admin approval
 */
export async function getSubmittedOnboardings(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('onboarding_status', 'submitted')
      .order('onboarding_completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching submitted onboardings:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

/**
 * Approve a contractor onboarding
 * 
 * @param contractorId - Contractor UUID
 * @param approvedBy - User ID of approver
 * @returns Success status
 */
export async function approveContractorOnboarding(
  contractorId: string,
  approvedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contractors')
      .update({
        onboarding_status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        status: 'active' // Activate contractor for payroll
      })
      .eq('id', contractorId);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}
