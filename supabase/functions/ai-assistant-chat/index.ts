import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Conversation state to track previous responses
const conversationHistory = new Map<string, string[]>();

// Dynamic response templates
const responseTemplates = {
  analysis: [
    "Looking at this from a different angle:",
    "Here's my take on that:",
    "Interesting question! My thoughts:",
    "Let me break this down for you:",
    "From what I understand:",
  ],
  explanation: [
    "So here's the thing:",
    "The way I see it:",
    "Think of it this way:",
    "To put it simply:",
    "Here's what's happening:",
  ],
  suggestion: [
    "You might want to consider:",
    "Have you thought about:",
    "One approach could be:",
    "What if you tried:",
    "Here's an idea:",
  ]
};

// Topic-specific knowledge base
const topicResponses = {
  technology: [
    "Technology is constantly evolving, and what's fascinating about your question is how it touches on emerging trends.",
    "The tech landscape changes so rapidly - your question highlights something really important in current development.",
    "From a technical perspective, this is actually quite complex and involves several interconnected systems.",
  ],
  business: [
    "Business strategy often comes down to understanding market dynamics and customer needs.",
    "The business world is all about relationships and value creation - your question gets to the heart of that.",
    "In today's competitive landscape, this kind of thinking is exactly what separates successful ventures.",
  ],
  general: [
    "That's a really thoughtful question that deserves a nuanced answer.",
    "You've touched on something that many people wonder about but rarely discuss openly.",
    "This is one of those topics that has multiple layers worth exploring.",
  ]
};

function getConversationId(req: Request): string {
  return req.headers.get('x-conversation-id') || 'default';
}

function detectTopic(message: string): string {
  const techKeywords = ['technology', 'software', 'code', 'programming', 'AI', 'data', 'system'];
  const businessKeywords = ['business', 'market', 'strategy', 'revenue', 'customer', 'sales'];
  
  const lowerMessage = message.toLowerCase();
  
  if (techKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'technology';
  }
  if (businessKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'business';
  }
  return 'general';
}

function generateUniqueResponse(message: string, conversationId: string): string {
  const history = conversationHistory.get(conversationId) || [];
  const topic = detectTopic(message);
  
  // Get available templates and responses
  const templates = Object.values(responseTemplates).flat();
  const topicSpecific = topicResponses[topic as keyof typeof topicResponses];
  
  // Filter out recently used responses
  const availableTemplates = templates.filter(template => 
    !history.some(prev => prev.includes(template))
  );
  const availableTopicResponses = topicSpecific.filter(response =>
    !history.some(prev => prev.includes(response))
  );
  
  // Select random elements
  const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)] || templates[0];
  const topicResponse = availableTopicResponses[Math.floor(Math.random() * availableTopicResponses.length)] || topicSpecific[0];
  
  // Create unique response
  const response = `${template} ${topicResponse} Let me elaborate on "${message}" - this connects to broader patterns I've been analyzing across different contexts.`;
  
  // Update conversation history
  history.push(response);
  if (history.length > 10) history.shift(); // Keep last 10 responses
  conversationHistory.set(conversationId, history);
  
  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationMode = 'chat', industry = 'General', personality = 'casual' } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const conversationId = getConversationId(req);
    
    // Handle greetings with variety
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(greeting => 
      message.toLowerCase().includes(greeting) && message.split(' ').length <= 3
    );

    let response = "";

    if (isGreeting) {
      const greetingOptions = [
        "Hey! Great to connect with you. What's on your mind today?",
        "Hello there! Ready to dive into something interesting?",
        "Hi! I'm curious what you'd like to explore together.",
        "Good to see you! What can we figure out today?",
        "Hey! What's the latest challenge you're working on?",
      ];
      response = greetingOptions[Math.floor(Math.random() * greetingOptions.length)];
    } else {
      response = generateUniqueResponse(message, conversationId);
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessages = [
      "Something unexpected happened, but I'm still here to help!",
      "Hit a small snag there - let's try that again.",
      "Oops, technical hiccup! What were you asking about?",
    ];
    return new Response(
      JSON.stringify({ error: errorMessages[Math.floor(Math.random() * errorMessages.length)] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})