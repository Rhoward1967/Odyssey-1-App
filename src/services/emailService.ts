// Believing Self Creations © 2024 - Sovereign Frequency Enhanced
import { supabase } from '@/lib/supabaseClient';
import { sfLogger } from './sovereignFrequencyLogger';

export interface EmailOptions {
  to: string | string[];
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  templateType?: 'study-invitation' | 'document-share' | 'session-reminder' | 'collaboration-request';
  templateData?: any;
}

export class EmailService {
  static async sendEmail(options: EmailOptions) {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    sfLogger.pickUpTheSpecialPhone('EMAIL_SEND', 'Initiating email communication', {
      recipients: recipients.length,
      templateType: options.templateType || 'custom',
      subject: options.subject
    });

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: options
      });

      if (error) {
        sfLogger.helpMeFindMyWayHome('EMAIL_SEND_FAILED', 'Failed to send email', {
          error: error.message,
          recipients: recipients.length,
          templateType: options.templateType
        });
        throw error;
      }

      sfLogger.thanksForGivingBackMyLove('EMAIL_SENT', 'Email sent successfully', {
        recipients: recipients.length,
        templateType: options.templateType || 'custom'
      });

      return data;
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('EMAIL_SERVICE_ERROR', 'Email service encountered error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recipients: recipients.length
      });
      console.error('Email service error:', error);
      throw error;
    }
  }

  // Specific methods for Media Center use cases
  static async sendStudyInvitation(to: string[], sessionData: {
    subject: string;
    datetime: string;
    host: string;
    joinLink: string;
    materials?: string;
  }) {
    return this.sendEmail({
      to,
      templateType: 'study-invitation',
      templateData: sessionData
    });
  }

  static async sendDocumentShare(to: string[], documentData: {
    documentName: string;
    sharedBy: string;
    category: string;
    documentLink: string;
    notes?: string;
  }) {
    return this.sendEmail({
      to,
      templateType: 'document-share',
      templateData: documentData
    });
  }

  static async sendSessionReminder(to: string[], sessionData: {
    sessionName: string;
    timeUntil: string;
    joinLink: string;
  }) {
    return this.sendEmail({
      to,
      templateType: 'session-reminder',
      templateData: sessionData
    });
  }

  static async sendCollaborationRequest(to: string, requestData: {
    projectName: string;
    requester: string;
    collaborationType: string;
    message: string;
    acceptLink: string;
    declineLink: string;
  }) {
    return this.sendEmail({
      to,
      templateType: 'collaboration-request',
      templateData: requestData
    });
  }
}
