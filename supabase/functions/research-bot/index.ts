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

    // Check for specific research topics and provide detailed responses
    const query = message.toLowerCase();
    let aiResponse = '';

    if (query.includes('ai trends') || query.includes('artificial intelligence')) {
      aiResponse = `🤖 **Latest AI Trends (2024)**

**🚀 Major Developments:**
• **Generative AI Evolution** - GPT-4, Claude 3.5, and Gemini leading conversational AI
• **Multimodal AI** - Models combining text, images, and video understanding
• **AI Agents** - Autonomous systems performing complex tasks
• **Small Language Models** - Efficient models for mobile and edge devices

**📊 Industry Impact:**
• **Healthcare** - AI-powered drug discovery and diagnostic tools
• **Education** - Personalized learning and AI tutoring systems
• **Business** - Process automation and intelligent decision support
• **Creative** - AI-generated content, art, and music tools

**🔮 Emerging Trends:**
• **AI Safety & Alignment** - Focus on responsible AI development
• **Federated Learning** - Privacy-preserving AI training
• **Quantum-AI Hybrid** - Combining quantum computing with AI
• **Neuromorphic Computing** - Brain-inspired AI hardware

**💡 Key Players:**
• OpenAI, Anthropic, Google DeepMind, Meta AI
• Emerging startups in specialized AI applications
• Open-source communities driving democratization

*Research indicates AI market expected to reach $1.8 trillion by 2030*`;

    } else if (query.includes('market') || query.includes('economy') || query.includes('finance')) {
      aiResponse = `📊 **Market Research Insights**

**📈 Current Market Conditions:**
• Global economic uncertainty with regional variations
• Technology sector leading innovation investments
• ESG (Environmental, Social, Governance) focus increasing
• Supply chain resilience becoming priority

**🏢 Industry Analysis:**
• **Technology** - AI, cloud computing, cybersecurity growth
• **Healthcare** - Biotech, telemedicine, personalized medicine
• **Energy** - Renewable transition, battery technology
• **Finance** - Fintech, digital payments, cryptocurrency evolution

**🔍 Research Methodology:**
• Primary data from industry surveys
• Secondary analysis of market reports
• Expert interviews and case studies
• Quantitative and qualitative insights

**📋 Key Metrics to Monitor:**
• Market capitalization trends
• Consumer sentiment indicators
• Innovation investment flows
• Regulatory impact assessments

*Data sources: Bloomberg, Reuters, McKinsey, PwC market research*`;

    } else if (query.includes('education') || query.includes('learning') || query.includes('study')) {
      aiResponse = `🎓 **Educational Research & Trends**

**📚 Modern Learning Approaches:**
• **Hybrid Learning** - Combining online and in-person education
• **Microlearning** - Bite-sized, focused learning modules
• **Adaptive Learning** - AI-powered personalized education paths
• **Collaborative Learning** - Peer-to-peer knowledge sharing

**🔬 Research Methodologies:**
• **Literature Reviews** - Systematic analysis of existing research
• **Case Studies** - In-depth examination of specific examples
• **Experimental Design** - Controlled studies with variables
• **Qualitative Research** - Interviews, surveys, observations

**💻 Technology in Education:**
• Learning Management Systems (LMS)
• Virtual and Augmented Reality applications
• AI tutoring and assessment tools
• Blockchain for credential verification

**📊 Educational Data:**
• Student performance analytics
• Engagement metrics and patterns
• Skill gap analysis in job markets
• Global education accessibility trends

*Sources: UNESCO, academic journals, educational technology reports*`;

    } else {
      // Fallback for general research queries
      aiResponse = `🔍 **Research Assistant Ready**

I can help you research various topics:

**📊 Business & Market Research:**
• Industry analysis and trends
• Competitive landscape studies
• Market sizing and forecasting
• Consumer behavior insights

**🎓 Academic Research:**
• Literature reviews and citations
• Research methodology guidance
• Data analysis and interpretation
• Academic writing support

**💡 Technology Research:**
• Emerging technology trends
• Technical specifications and comparisons
• Innovation case studies
• Implementation best practices

**🏥 Professional Research:**
• Medical and healthcare studies
• Legal precedents and case law
• Scientific papers and journals
• Policy and regulatory analysis

Please specify what you'd like to research, and I'll provide detailed insights with relevant sources and methodologies.`;
    }

    // Try Hugging Face API as enhancement, but don't fail if it doesn't work
    try {
      const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_API_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (hfResponse.ok) {
        const hfData = await hfResponse.json();
        if (hfData[0]?.generated_text) {
          aiResponse += `\n\n**Additional AI Analysis:**\n${hfData[0].generated_text}`;
        }
      }
    } catch (hfError) {
      console.log('Hugging Face API unavailable, using fallback response');
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: 'research-assistant',
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
        response: `🔍 **Research Assistant Available**

I can help you research:
• AI and technology trends
• Market analysis and business insights  
• Educational resources and methodologies
• Industry reports and case studies

What specific topic would you like me to research for you?`,
        error: false,
        fallback: true
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
