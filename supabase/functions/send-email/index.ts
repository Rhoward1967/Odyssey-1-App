import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// This function expects a POST body: { to, subject, content }
// Set your SendGrid API key in the environment as SENDGRID_API_KEY

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const FROM_EMAIL =
  Deno.env.get('SENDGRID_FROM_EMAIL') || 'no-reply@example.com';

if (!SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in the environment.');
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    let to: string | undefined,
      subject: string | undefined,
      content: string | undefined;
    try {
      const body = await req.json();
      if (typeof body !== 'object' || body === null) {
        return new Response('Invalid JSON body', { status: 400 });
      }
      to = typeof body.to === 'string' ? body.to : undefined;
      subject = typeof body.subject === 'string' ? body.subject : undefined;
      content = typeof body.content === 'string' ? body.content : undefined;
    } catch (jsonErr) {
      return new Response('Malformed JSON body', { status: 400 });
    }
    if (!to || !subject || !content) {
      return new Response('Missing required fields', { status: 400 });
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: FROM_EMAIL },
      content: [
        {
          type: 'text/plain',
          value: content,
        },
      ],
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return new Response(`SendGrid error: ${errorText}`, { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
