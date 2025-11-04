import { supabase } from '@/lib/supabaseClient';

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
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: options
      });

      if (error) throw error;
      return data;
    } catch (error) {
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
