import { supabase } from '../lib/supabaseClient';

/**
 * 🛰️ CONTRACTOR APPROVAL SERVICE
 * Purpose: Approve/reject contractor onboarding with email notifications
 * Security: Audit trail logging, admin-only access
 * Constitutional: Success/rejection email loop for professional handshake
 */

interface ApprovalResult {
  success: boolean;
  error?: string;
}

/**
 * Approve a contractor onboarding submission
 * 
 * @param contractorId - UUID of contractor to approve
 * @param adminId - UUID of admin performing approval
 * @returns Success status
 */
export async function approveContractor(
  contractorId: string,
  adminId: string
): Promise<ApprovalResult> {
  try {
    // 1. Update contractor status to approved
    const { data: contractor, error: updateError } = await supabase
      .from('contractors')
      .update({
        onboarding_status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        status: 'active', // Activate for payroll
        rejection_reason: null, // Clear any previous rejection
        rejected_by: null,
        rejected_at: null
      })
      .eq('id', contractorId)
      .select()
      .single();

    if (updateError || !contractor) {
      throw new Error(`Approval failed: ${updateError?.message || 'Unknown error'}`);
    }

    // 2. Log approval in audit trail
    const { error: auditError } = await supabase
      .from('contractor_approval_audit')
      .insert([
        {
          contractor_id: contractorId,
          action: 'approved',
          performed_by: adminId,
          performed_at: new Date().toISOString(),
          notes: 'Onboarding approved - direct deposit activated',
          previous_status: 'submitted',
          new_status: 'approved',
          metadata: {
            contractor_name: contractor.full_name,
            email: contractor.email,
            approval_timestamp: new Date().toISOString()
          }
        }
      ]);

    if (auditError) {
      console.error('Audit log error:', auditError);
      // Don't fail approval if audit fails, just log
    }

    // 3. Send success email and track delivery
    const emailResult = await sendApprovalEmail(contractor.email, contractor.full_name);
    
    if (emailResult.success && emailResult.emailId) {
      // Update contractor with email tracking
      await supabase
        .from('contractors')
        .update({
          approval_email_sent_at: new Date().toISOString(),
          approval_email_id: emailResult.emailId
        })
        .eq('id', contractorId);
      
      console.log(`✅ Approval email tracked (Email ID: ${emailResult.emailId})`);
    } else {
      console.warn(`⚠️ Approval email send failed:`, emailResult.error);
    }

    return { success: true };
  } catch (err) {
    console.error('Contractor approval error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Reject a contractor onboarding submission
 * 
 * @param contractorId - UUID of contractor to reject
 * @param adminId - UUID of admin performing rejection
 * @param reason - Reason for rejection
 * @returns Success status
 */
export async function rejectContractor(
  contractorId: string,
  adminId: string,
  reason: string
): Promise<ApprovalResult> {
  try {
    // 1. Update contractor status to rejected
    const { data: contractor, error: updateError } = await supabase
      .from('contractors')
      .update({
        onboarding_status: 'rejected',
        rejected_by: adminId,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        status: 'inactive' // Keep inactive until re-submission
      })
      .eq('id', contractorId)
      .select()
      .single();

    if (updateError || !contractor) {
      throw new Error(`Rejection failed: ${updateError?.message || 'Unknown error'}`);
    }

    // 2. Log rejection in audit trail
    const { error: auditError } = await supabase
      .from('contractor_approval_audit')
      .insert([
        {
          contractor_id: contractorId,
          action: 'rejected',
          performed_by: adminId,
          performed_at: new Date().toISOString(),
          notes: reason,
          previous_status: 'submitted',
          new_status: 'rejected',
          metadata: {
            contractor_name: contractor.full_name,
            email: contractor.email,
            rejection_reason: reason,
            rejection_timestamp: new Date().toISOString()
          }
        }
      ]);

    if (auditError) {
      console.error('Audit log error:', auditError);
      // Don't fail rejection if audit fails, just log
    }

    // 3. Send rejection email with instructions and track delivery
    const emailResult = await sendRejectionEmail(
      contractor.email,
      contractor.full_name,
      reason,
      contractor.onboarding_token
    );
    
    if (emailResult.success && emailResult.emailId) {
      // Update contractor with email tracking
      await supabase
        .from('contractors')
        .update({
          rejection_email_sent_at: new Date().toISOString(),
          rejection_email_id: emailResult.emailId
        })
        .eq('id', contractorId);
      
      console.log(`✅ Rejection email tracked (Email ID: ${emailResult.emailId})`);
    } else {
      console.warn(`⚠️ Rejection email send failed:`, emailResult.error);
    }

    return { success: true };
  } catch (err) {
    console.error('Contractor rejection error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Send approval success email to contractor
 * 
 * @param email - Contractor email
 * @param name - Contractor name
 */
async function sendApprovalEmail(email: string, name: string): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const { generateContractorApprovalEmail } = await import('./contractorEmailTemplates');
    const { subject, html, text } = generateContractorApprovalEmail(name);

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject,
        html,
        textContent: text
      }
    });

    if (error) {
      console.error('❌ Failed to send approval email:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Approval email sent to ${email} (ID: ${data.emailId})`);
    return { success: true, emailId: data.emailId };
  } catch (err) {
    console.error('❌ Approval email error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Send rejection email to contractor with re-submission instructions
 * 
 * @param email - Contractor email
 * @param name - Contractor name
 * @param reason - Rejection reason
 * @param token - Original onboarding token for re-submission
 */
async function sendRejectionEmail(
  email: string,
  name: string,
  reason: string,
  token?: string
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const { generateContractorRejectionEmail } = await import('./contractorEmailTemplates');
    const baseUrl = window.location.origin;
    const resubmitUrl = token ? `${baseUrl}/onboarding/contractor/${token}` : undefined;
    
    const { subject, html, text } = generateContractorRejectionEmail(
      name,
      reason,
      resubmitUrl
    );

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject,
        html,
        textContent: text
      }
    });

    if (error) {
      console.error('❌ Failed to send rejection email:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Rejection email sent to ${email} (ID: ${data.emailId})`);
    return { success: true, emailId: data.emailId };
  } catch (err) {
    console.error('❌ Rejection email error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Get voided check image URL for viewing
 * 
 * @param contractorId - UUID of contractor
 * @returns Signed URL for voided check image
 */
export async function getVoidedCheckUrl(contractorId: string): Promise<string | null> {
  try {
    // 1. Get contractor's voided_check_url path
    const { data: contractor, error: fetchError } = await supabase
      .from('contractors')
      .select('voided_check_url')
      .eq('id', contractorId)
      .single();

    if (fetchError || !contractor?.voided_check_url) {
      return null;
    }

    // 2. Generate signed URL (valid for 1 hour)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('contractor-docs')
      .createSignedUrl(contractor.voided_check_url, 3600);

    if (urlError || !signedUrl) {
      console.error('Error generating signed URL:', urlError);
      return null;
    }

    return signedUrl.signedUrl;
  } catch (err) {
    console.error('Error fetching voided check:', err);
    return null;
  }
}

/**
 * Get all contractors awaiting approval
 * 
 * @returns List of submitted contractors
 */
export async function getContractorsAwaitingApproval(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('onboarding_status', 'submitted')
      .order('onboarding_completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}
