import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TemplateData {
  subject?: string;
  datetime?: string;
  host?: string;
  joinLink?: string;
  materials?: string;
  documentName?: string;
  sharedBy?: string;
  category?: string;
  documentLink?: string;
  notes?: string;
  sessionName?: string;
  timeUntil?: string;
  projectName?: string;
  requester?: string;
  collaborationType?: string;
  message?: string;
  acceptLink?: string;
  declineLink?: string;
}

interface EmailRequest {
  to: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateType?: 'study-invitation' | 'document-share' | 'session-reminder' | 'collaboration-request';
  templateData?: TemplateData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, htmlContent, textContent, templateType, templateData }: EmailRequest = await req.json()

    // Pre-built email templates for Media Center
    const getEmailTemplate = (type: string, data: TemplateData) => {
      switch (type) {
        case 'study-invitation':
          return {
            subject: `📚 Study Session Invitation: ${data.subject}`,
            html: `
              <h2>🎓 You're Invited to a Study Session!</h2>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Date & Time:</strong> ${data.datetime}</p>
              <p><strong>Host:</strong> ${data.host}</p>
              <p><strong>Join Link:</strong> <a href="${data.joinLink}">Click to Join</a></p>
              <p>Prepare by reviewing: ${data.materials || 'No specific materials'}</p>
              <hr>
              <p><em>Powered by ODYSSEY-1 Media Center</em></p>
            `
          };
        
        case 'document-share':
          return {
            subject: `📄 Document Shared: ${data.documentName}`,
            html: `
              <h2>📄 New Document Shared</h2>
              <p><strong>Document:</strong> ${data.documentName}</p>
              <p><strong>Shared by:</strong> ${data.sharedBy}</p>
              <p><strong>Category:</strong> ${data.category}</p>
              <p><a href="${data.documentLink}">View Document</a></p>
              <p><strong>Notes:</strong> ${data.notes || 'No additional notes'}</p>
              <hr>
              <p><em>Access your documents anytime in ODYSSEY-1 Media Center</em></p>
            `
          };
        
        case 'session-reminder':
          return {
            subject: `⏰ Session Reminder: ${data.sessionName}`,
            html: `
              <h2>⏰ Your Session Starts Soon!</h2>
              <p><strong>Session:</strong> ${data.sessionName}</p>
              <p><strong>Starting in:</strong> ${data.timeUntil}</p>
              <p><strong>Join Link:</strong> <a href="${data.joinLink}">Join Now</a></p>
              <p>Make sure you have your materials ready!</p>
              <hr>
              <p><em>ODYSSEY-1 Media Center Notification</em></p>
            `
          };
        
        case 'collaboration-request':
          return {
            subject: `🤝 Collaboration Request: ${data.projectName}`,
            html: `
              <h2>🤝 New Collaboration Request</h2>
              <p><strong>Project:</strong> ${data.projectName}</p>
              <p><strong>From:</strong> ${data.requester}</p>
              <p><strong>Type:</strong> ${data.collaborationType}</p>
              <p><strong>Message:</strong> ${data.message}</p>
              <p><a href="${data.acceptLink}">Accept</a> | <a href="${data.declineLink}">Decline</a></p>
              <hr>
              <p><em>Manage collaborations in ODYSSEY-1 Media Center</em></p>
            `
          };
        
        default:
          return {
            subject: subject,
            html: htmlContent || `<p>${textContent}</p>`
          };
      }
    };

    // Get email content
    let emailSubject = subject;
    let emailHtml = htmlContent;

    if (templateType && templateData) {
      const template = getEmailTemplate(templateType, templateData);
      emailSubject = template.subject;
      emailHtml = template.html;
    }

    // Send email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
            subject: emailSubject
          }
        ],
        from: {
          email: 'noreply@odyssey-platform.com',
          name: 'ODYSSEY-1 Media Center'
        },
        content: [
          {
            type: 'text/html',
            value: emailHtml || `<p>${textContent}</p>`
          }
        ]
      })
    });

    if (!sendGridResponse.ok) {
      throw new Error(`SendGrid API error: ${sendGridResponse.status}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email sent successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error: unknown) {
    console.error('Email Error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to send email',
        message: errorMessage
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
