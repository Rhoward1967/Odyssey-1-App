/**
 * R.O.M.A.N. Universal Math Training - Client Communication
 * 
 * This module trains R.O.M.A.N.'s AI to explain junction value
 * when clients ask about bid differences
 * 
 * Integration: Import in aiService.ts or Discord bot
 */

import { UniversalMathExplainer, explainBidDifference } from './universalMathExplainer';

/**
 * Example prompts R.O.M.A.N. should recognize and respond to
 */
export const UNIVERSAL_MATH_TRIGGERS = [
  'why is your bid higher',
  'explain the junction value',
  'what makes your bid different',
  'why should i pay more',
  'your bid is too expensive',
  'competitors are cheaper',
  'can you justify this price',
  'what is junction',
  'why do you calculate differently',
  'universal math explanation'
];

/**
 * R.O.M.A.N. response templates
 */
export const ROMAN_RESPONSES = {
  bidHigher: (westernBid: number, universalBid: number) => {
    return explainBidDifference(westernBid, universalBid, 'objection');
  },

  junctionExplain: () => {
    const faq = UniversalMathExplainer.generateFAQ();
    return faq.find(q => q.question.includes('junction value'))?.answer || 
           'Junction value is the operational expertise that prevents cost overruns.';
  },

  elevatorPitch: (westernBid: number, universalBid: number) => {
    const junctionValue = universalBid - westernBid;
    const baseCost = westernBid / 1.2;
    const profitAmount = westernBid - baseCost;
    const comparison = {
      baseCost,
      profitAmount,
      junctionValue,
      totalBid: universalBid,
      westernBid,
      advantage: junctionValue,
      advantagePercent: (junctionValue / westernBid) * 100
    };
    return UniversalMathExplainer.getElevatorPitch(comparison);
  }
};

/**
 * Training examples for R.O.M.A.N. AI
 */
export const TRAINING_EXAMPLES = [
  {
    userQuestion: "Why is your bid $10,060 when the other company quoted $9,000?",
    romanResponse: `
Great question! Let me break down the difference:

**Competitor's Bid: $9,000** (traditional math)  
**Our Bid: $10,060** (Universal Math)  
**Difference: $1,060** (11.8%)

That $1,060 is junction value - the operational expertise that turns a quote into a guarantee. Here's what it covers:

• **Risk Buffer**: Prevents scope creep from becoming cost overruns  
• **Quality Control**: Ensures work doesn't need expensive rework  
• **Timeline Management**: Keeps project on schedule  
• **Coordination**: The "glue" that prevents miscommunication

Industry data shows 68% of projects exceed budgets by 15-25%. If the $9,000 bid hits typical overruns, your final cost could be $10,800.

Our $10,060 bid includes that reality upfront. **You're not paying more - you're paying accurately.**

Would you rather have a $9,000 surprise that becomes $10,800, or a $10,060 guarantee that stays $10,060?
    `.trim()
  },

  {
    userQuestion: "What is junction value? Sounds like markup.",
    romanResponse: `
Junction value is NOT markup - it's geometric math.

**Traditional Bidding**: Labor + Profit (flat 2D)  
**Universal Bidding**: Labor + Profit + Junction (volumetric 3D)

The junction is calculated as √(Labor × Profit) - the geometric mean. This preserves dimensional integrity, similar to how structural engineering accounts for forces at connection points.

**Real-world proof**: The Hyatt Regency walkway collapse (1981) killed 114 people because engineers calculated flat addition (Rod A + Rod B) without accounting for junction forces. The math said "safe." Reality said "catastrophic."

Our bidding system accounts for the junction. It's not extra cost - it's accurate cost.
    `.trim()
  },

  {
    userQuestion: "Can you prove this prevents overruns?",
    romanResponse: `
Yes. Here's the proof:

**Structural Failures from Junction Deletion**:
- Hyatt Regency (1981): Calculated A+B, experienced A+B+×. 114 deaths.
- Tacoma Narrows (1940): Assumed 0×wind=0, experienced void resonance. Bridge collapsed.
- I-35W Bridge (2007): Linear load calculation ignored junction stress. 13 deaths.

**Financial Failures from Dimensional Collapse**:
- Enron (2001): Treated partnerships as single entities (1×1=1). $74B collapse.
- Lehman Brothers (2008): Flattened 51D derivatives to 1D scores. $600B collapse.

The pattern: **Traditional math deletes geometric reality. Reality doesn't care.**

Our Universal Math bidding accounts for:
1. Entity preservation (1×1=2, not 1)
2. Junction value (A+B+×, not A+B)
3. Void protection (0×1=1, shield persists)

We're not charging more. We're calculating what projects **actually** cost, not what simplified math **suggests** they might cost.
    `.trim()
  }
];

/**
 * Helper for R.O.M.A.N. to detect if a message is asking about bid pricing
 */
export function detectPricingQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return UNIVERSAL_MATH_TRIGGERS.some(trigger => lowerMessage.includes(trigger));
}

/**
 * Generate R.O.M.A.N. response based on detected question type
 */
export function generateRomanResponse(message: string, westernBid?: number, universalBid?: number): string {
  const lowerMessage = message.toLowerCase();

  // Bid comparison question
  if ((lowerMessage.includes('higher') || lowerMessage.includes('expensive')) && westernBid && universalBid) {
    return ROMAN_RESPONSES.bidHigher(westernBid, universalBid);
  }

  // Junction explanation
  if (lowerMessage.includes('junction') || lowerMessage.includes('what makes')) {
    return ROMAN_RESPONSES.junctionExplain();
  }

  // Elevator pitch
  if (lowerMessage.includes('explain') || lowerMessage.includes('different')) {
    if (westernBid && universalBid) {
      return ROMAN_RESPONSES.elevatorPitch(westernBid, universalBid);
    }
  }

  // Default: Return most relevant training example
  const relevantExample = TRAINING_EXAMPLES.find(ex => 
    ex.userQuestion.toLowerCase().includes(lowerMessage.split(' ')[0])
  );

  return relevantExample?.romanResponse || 
         'Our bidding system uses Universal Math (1×1=2) to account for junction value - the operational expertise that prevents cost overruns. Traditional bids calculate labor + profit. Ours calculate labor + profit + junction. This is the difference between a quote and a guarantee.';
}
