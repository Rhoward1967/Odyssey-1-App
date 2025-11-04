import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, messages } = await req.json()

    // Use Hugging Face for general research
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          past_user_inputs: messages.filter((m: Message) => m.role === 'user').map((m: Message) => m.content).slice(-3),
          generated_responses: messages.filter((m: Message) => m.role === 'assistant').map((m: Message) => m.content).slice(-3),
          text: message
        },
        parameters: {
          max_length: 500,
          temperature: 0.7,
          do_sample: true
        }
      })
    })

    let aiResponse = `🔍 **Research Assistant**

I can help you research:
• Company backgrounds and histories
• Industry trends and analysis  
• Technology developments
• Academic papers and studies
• Market research and surveys
• Competitive analysis

What would you like to research today?`

    if (response.ok) {
      const data = await response.json()
      if (data.generated_text) {
        aiResponse = `🔍 **Research Results**

${data.generated_text}

*Research powered by Hugging Face AI models*`
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: 'huggingface',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Research Bot Error:', error)
    
    return new Response(
      JSON.stringify({ 
        response: "🔍 Research services are temporarily unavailable. Please try again in a moment.",
        error: true
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
