import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Conversation state to track previous responses
const conversationHistory = new Map<string, string[]>();

// Dynamic response templates (for future use)
const _responseTemplates = {
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
    "I'd recommend:",
  ],
  greeting: [
    "Hey! 👋",
    "Hello there! 😊",
    "Hi! How's it going?",
    "Good to see you!",
    "What's up! 🌟",
  ],
  encouragement: [
    "That sounds great!",
    "You're on the right track!",
    "Love that idea!",
    "That makes total sense!",
    "Exactly! 💡",
  ]
};

// Casual, conversational responses
const generateNaturalResponse = (userMessage: string, previousResponses: string[] = []): string => {
  const message = userMessage.toLowerCase();

  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    const greetings = [
      "Hey there! 😊 What's on your mind today?",
      "Hi! Great to chat with you! What can I help you with?",
      "Hello! 👋 How can I make your day better?",
      "Hey! Ready for a friendly conversation?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Business-related queries
  if (message.includes('business') || message.includes('revenue') || message.includes('profit')) {
    const businessResponses = [
      "Business talk - I love it! 💼 What aspect are you curious about?",
      "Ah, diving into the business side of things! What's your main question?",
      "Business growth is exciting! What would you like to explore?",
      "Let's talk business! 📈 What's your biggest challenge right now?",
    ];
    return businessResponses[Math.floor(Math.random() * businessResponses.length)];
  }

  // Budget/financial queries
  if (message.includes('budget') || message.includes('money') || message.includes('cost')) {
    const budgetResponses = [
      "Money matters! 💰 Let's figure this out together. What's your situation?",
      "Budget planning is so important! What are you trying to work out?",
      "Financial stuff can be tricky, but we've got this! What do you need help with?",
      "Smart to think about the budget! What's your main concern?",
    ];
    return budgetResponses[Math.floor(Math.random() * budgetResponses.length)];
  }

  // Help/support queries
  if (message.includes('help') || message.includes('support') || message.includes('problem')) {
    const helpResponses = [
      "I'm here to help! 🤝 What's going on?",
      "Let's tackle this together! What do you need assistance with?",
      "No worries, we'll figure it out! What's the challenge?",
      "Happy to help! What can I do for you?",
    ];
    return helpResponses[Math.floor(Math.random() * helpResponses.length)];
  }

  // Default conversational responses
  const defaultResponses = [
    "That's interesting! Tell me more about that.",
    "I hear you! What's your take on it?",
    "Hmm, that got me thinking... What made you bring that up?",
    "Cool question! Let me share some thoughts on that...",
    "You know what? That's actually pretty important. Here's what I think:",
    "Great point! Have you considered looking at it this way?",
    "I love chatting about this stuff! What's your experience been?",
    "That's a solid question! Here's how I see it:",
  ];

  // Avoid repeating recent responses
  const availableResponses = defaultResponses.filter(response =>
    !previousResponses.some(prev => prev.includes(response.substring(0, 10)))
  );

  const selectedResponses = availableResponses.length > 0 ? availableResponses : defaultResponses;
  return selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversation_history } = await req.json()

    if (!message) {
      throw new Error('No message provided')
    }

    // Track conversation for this session (simplified)
    const sessionId = req.headers.get('x-session-id') || 'default';
    const previousResponses = conversationHistory.get(sessionId) || [];

    // Generate natural, conversational response
    const response = generateNaturalResponse(message, previousResponses);

    // Update conversation history
    const updatedHistory = [...previousResponses, response].slice(-5); // Keep last 5 responses
    conversationHistory.set(sessionId, updatedHistory);

    return new Response(
      JSON.stringify({
        response,
        timestamp: new Date().toISOString(),
        conversation_length: (conversation_history?.length || 0) + 1
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in conversational-ai-chat function:', error)

    return new Response(
      JSON.stringify({
        response: "Oops! Something went wrong on my end. 😅 Mind trying that again?",
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
