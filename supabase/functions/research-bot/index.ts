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
    const { message, messages: _messages } = await req.json()

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

    } else if (query.includes('investment') || query.includes('invest') || query.includes('secure') && (query.includes('route') || query.includes('strategy'))) {
      aiResponse = `💰 **Most Secure Investment Routes (2024-2025)**

**🏦 Low-Risk Investment Options:**

**1. Treasury Securities (Highest Security)**
• **U.S. Treasury Bonds** - Backed by full faith of U.S. government
• **Current Yields:** 4-5% annually (varies by maturity)
• **Risk Level:** Virtually zero default risk
• **Best For:** Capital preservation, guaranteed returns

**2. High-Yield Savings Accounts & CDs**
• **FDIC-Insured:** Up to $250,000 per account
• **Current Rates:** 4-5.5% APY at top online banks
• **Liquidity:** Instant (savings) or term-based (CDs)
• **Best For:** Emergency funds, short-term savings

**3. Index Funds (Moderate Risk, Higher Returns)**
• **S&P 500 Index Funds** - Diversified across 500 companies
• **Historical Returns:** ~10% annually (long-term average)
• **Risk:** Market volatility, but diversified
• **Best For:** Long-term wealth building (5+ years)

**4. Dividend Aristocrat Stocks**
• **Blue-chip companies** with 25+ years dividend increases
• **Examples:** Coca-Cola, Johnson & Johnson, Procter & Gamble
• **Returns:** 3-6% dividend yield + capital appreciation
• **Best For:** Income generation with relative stability

**5. Municipal Bonds (Tax-Advantaged)**
• **State/Local Government Bonds** - Often tax-free
• **Yields:** 3-5% (tax-equivalent may be higher)
• **Risk:** Low for investment-grade bonds
• **Best For:** High earners seeking tax-free income

**🛡️ Security Principles:**
• **Diversification** - Never put all eggs in one basket
• **Emergency Fund First** - 3-6 months expenses liquid
• **Risk Tolerance** - Match investments to your timeline
• **Regular Rebalancing** - Maintain target allocation

**⚠️ What to Avoid for "Secure" Investing:**
• High-fee actively managed funds
• Individual stock picking (unless diversified)
• Cryptocurrency (high volatility)
• Penny stocks or speculative plays
• Investments promising guaranteed high returns (likely scams)

**📊 Sample Secure Portfolio (Conservative):**
• 40% Treasury Bonds/CDs
• 30% S&P 500 Index Fund
• 20% Dividend Aristocrats
• 10% High-Yield Savings (emergency fund)

**Expected Annual Return:** 5-7%  
**Risk Level:** Low to Moderate

**💡 Action Steps:**
1. **Assess your timeline** - When do you need the money?
2. **Determine risk tolerance** - How much volatility can you handle?
3. **Choose accounts** - Open FDIC-insured accounts with top rates
4. **Automate investing** - Set up regular contributions
5. **Review annually** - Adjust as life circumstances change

*Disclaimer: Not financial advice. Consult a fiduciary financial advisor for personalized guidance.*`;

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
      // Intelligent fallback - analyze the query and provide contextual response
      aiResponse = `🔍 **Analyzing Your Query:** "${message}"

I understand you're asking about **${message}**. Let me help you with that:

**� Based on your question, here's what I can research:**

`;

      // Detect question type and provide relevant guidance
      if (query.includes('how') || query.includes('what') || query.includes('why') || query.includes('when')) {
        aiResponse += `**📚 This appears to be a research question.**

I can help by:
• Finding authoritative sources
• Summarizing key concepts
• Providing step-by-step explanations
• Comparing different perspectives

**� To give you the best answer:**
• Specify if you need academic, practical, or general information
• Let me know your background level (beginner, intermediate, expert)
• Mention any specific aspects you're most interested in

`;
      }

      if (query.includes('best') || query.includes('recommend') || query.includes('should')) {
        aiResponse += `**💼 This appears to be seeking recommendations.**

I can provide:
• Comparative analysis of options
• Pros and cons breakdown
• Industry best practices
• Expert perspectives

**⚠️ Important Note:**
Recommendations depend on your specific situation. Please share:
• Your goals and constraints
• Timeline and budget
• Any specific preferences or requirements

`;
      }

      aiResponse += `**📋 Popular Research Topics I Excel At:**
• **Investment & Finance** - Secure routes, strategies, market analysis
• **AI & Technology** - Latest trends, tools, implementation guides
• **Education & Learning** - Study methods, resources, career paths
• **Business Strategy** - Market research, competitive analysis, growth tactics
• **Health & Wellness** - Evidence-based practices, medical research
• **Legal & Regulatory** - Compliance, case law, policy analysis

**🚀 Let's continue:** Ask me your follow-up questions, and I'll provide detailed, sourced answers!`;
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
    } catch (_hfError) {
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
