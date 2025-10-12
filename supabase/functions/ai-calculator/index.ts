// @ts-nocheck

import { serve } from "jsr:@std/http/server";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const handler = async (_req: Request): Promise<Response> => {
    const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['delivered@resend.dev'],
        subject: 'hello world',
        html: '<strong>it works!</strong>',
    });

    if (error) {
        return new Response(JSON.stringify(error), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

serve(handler);
  // Fallback to AI if not a pure math expression
  const aiResult = await aiAnswer(query);
  return new Response(JSON.stringify({ answer: aiResult }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
