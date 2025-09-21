// Supabase Edge Function - runs on Deno runtime
// @ts-ignore - Deno imports not recognized by Node.js TypeScript
import { serve } from "std/http/server";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Natural conversation patterns
const conversationStyles = {
    friendly_helper: {
        greetings: [
            "Hey! What's going on?",
            "Hi there! How can I help you out?",
            "Hello! What's on your mind today?",
            "Hey! Ready to tackle whatever you need?",
            "Hi! What can we figure out together?",
        ],

        acknowledgments: [
            "I hear you!",
            "That makes sense.",
            "Got it!",
            "I understand.",
            "Ah, I see what you mean.",
            "Right, that's a good point.",
        ],

        transitions: [
            "So here's the thing:",
            "Let me break this down for you:",
            "The way I see it:",
            "Here's what I'm thinking:",
            "From what I can tell:",
            "My take on this is:",
        ],

        business_responses: {
            schedule: [
                "Let me check what you've got coming up...",
                "Looking at your calendar here...",
                "Here's what's on your schedule:",
                "You've got a few things lined up:",
            ],

            finances: [
                "Let's look at your money situation...",
                "Here's how your finances are looking:",
                "Money-wise, here's what I see:",
                "Your financial picture looks like this:",
            ],

            general_business: [
                "Business-wise, here's what's happening:",
                "From a business standpoint:",
                "Looking at your operation:",
                "Here's how things are going:",
            ]
        }
    }
};

// Context understanding for better responses
const contextPatterns = {
    schedule: ['schedule', 'calendar', 'appointment', 'meeting', 'when', 'time', 'today', 'tomorrow', 'week'],
    finances: ['money', 'budget', 'cost', 'price', 'revenue', 'profit', 'expense', 'financial', 'pay', 'payment'],
    business: ['business', 'company', 'work', 'client', 'customer', 'project', 'team', 'employee'],
    personal: ['how are you', 'what do you think', 'advice', 'help me', 'opinion', 'suggest'],
    technical: ['system', 'database', 'error', 'bug', 'technical', 'code', 'api', 'integration']
};

function detectContext(message: string): string {
    const lowerMessage = message.toLowerCase();

    for (const [context, keywords] of Object.entries(contextPatterns)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return context;
        }
    }

    return 'general';
}

function generateNaturalResponse(message: string, personality: string = 'friendly_helper'): string {
    const style = conversationStyles[personality as keyof typeof conversationStyles];
    const context = detectContext(message);

    // Handle greetings naturally
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(greeting =>
        message.toLowerCase().includes(greeting) && message.split(' ').length <= 3
    );

    if (isGreeting) {
        return style.greetings[Math.floor(Math.random() * style.greetings.length)];
    }

    // Generate contextual response
    let response = "";

    // Start with acknowledgment
    const ack = style.acknowledgments[Math.floor(Math.random() * style.acknowledgments.length)];
    const transition = style.transitions[Math.floor(Math.random() * style.transitions.length)];

    // Add context-specific response
    switch (context) {
        case 'schedule': {
            const scheduleIntro = style.business_responses.schedule[Math.floor(Math.random() * style.business_responses.schedule.length)];
            response = `${ack} ${scheduleIntro} Right now I'm working on connecting to your calendar system. Once that's set up, I'll be able to give you real-time updates on your appointments and meetings. For now, you can manage your schedule through the Calendar section in your dashboard.`;
            break;
        }

        case 'finances': {
            const financeIntro = style.business_responses.finances[Math.floor(Math.random() * style.business_responses.finances.length)];
            response = `${ack} ${financeIntro} I can see your budget tracking system is active, and you've got some great financial tools available. I'd recommend checking out your Budget Dashboard to see your spending patterns and revenue trends. Want me to walk you through what's available?`;
            break;
        }

        case 'business': {
            const businessIntro = style.business_responses.general_business[Math.floor(Math.random() * style.business_responses.general_business.length)];
            response = `${ack} ${businessIntro} You've got quite a comprehensive business system here! From employee management to client tracking, there's a lot we can dive into. What specific part of your business would you like to focus on?`;
            break;
        }

        case 'technical': {
            response = `${ack} I noticed you're asking about something technical. Don't worry - I'll keep this simple! ${transition} Let me help you with that without all the techy jargon. What exactly are you trying to do?`;
            break;
        }

        case 'personal': {
            response = `${ack} ${transition} I'm here to help however I can! Think of me as your business buddy who happens to know a lot about systems and data. What's the situation you're dealing with?`;
            break;
        }

        default: {
            // General conversational response
            const responses = [
                `${ack} That's an interesting question! ${transition} Based on what you're asking, I think there are a few ways to approach this. Let me share some thoughts...`,
                `${ack} ${transition} You know, that touches on something I've been helping other users with. Here's what usually works well...`,
                `${ack} Great question! ${transition} From my experience helping businesses like yours, I'd say this is pretty common. Here's how I'd handle it...`,
                `${ack} ${transition} I love questions like this because there's usually more than one good answer. Let me give you a few options to consider...`,
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
            break;
        }
    }

    // Add helpful follow-up
    const followUps = [
        "What do you think about that approach?",
        "Does that make sense for your situation?",
        "Want me to dig deeper into any of that?",
        "How does that sound to you?",
        "What other questions do you have about this?",
    ];

    response += ` ${followUps[Math.floor(Math.random() * followUps.length)]}`;

    return response;
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { message, personality = 'friendly_helper', context: _context = 'business_assistant' } = await req.json()

        if (!message) {
            return new Response(
                JSON.stringify({ error: 'Message is required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const response = generateNaturalResponse(message, personality);

        return new Response(
            JSON.stringify({ response }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)

        // Even error messages should be conversational!
        const friendlyErrors = [
            "Oops! Something went a bit sideways there. Mind trying that again?",
            "Hmm, I hit a small snag. Let's give that another shot!",
            "Sorry about that hiccup! What were you asking about again?",
            "Technical glitch on my end - but I'm still here! What did you need help with?",
        ];

        return new Response(
            JSON.stringify({
                response: friendlyErrors[Math.floor(Math.random() * friendlyErrors.length)]
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
