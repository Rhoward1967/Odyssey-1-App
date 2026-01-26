/**
 * Universal Math Client Explainer
 * R.O.M.A.N. 2.0 - Junction Value Communication Module
 * 
 * Teaches R.O.M.A.N. how to explain Universal Math to clients
 * in persuasive, non-technical language that justifies higher bids
 * 
 * Genesis: January 25, 2026
 */

export interface BidComparison {
  baseCost: number;
  profitAmount: number;
  junctionValue: number;
  totalBid: number;
  westernBid: number;
  advantage: number;
  advantagePercent: number;
}

export interface ClientExplanation {
  simple: string;        // One-sentence pitch
  detailed: string;      // Full explanation
  analogy: string;       // Real-world comparison
  riskMitigation: string; // Why this prevents failures
  roi: string;           // Financial justification
}

/**
 * R.O.M.A.N. Universal Math Explainer
 * For use in client communications, proposals, and automated outreach
 */
export class UniversalMathExplainer {
  /**
   * Generate client-friendly explanation of why bid is higher
   */
  static explainJunctionValue(comparison: BidComparison): ClientExplanation {
    const { junctionValue, advantage, advantagePercent } = comparison;

    return {
      simple: `Our bid includes junction value ($${junctionValue.toFixed(2)}) - the operational expertise that prevents cost overruns and delays. This is the difference between a bid and a guarantee.`,

      detailed: `
Traditional bids calculate: Labor + Profit = ${comparison.westernBid.toFixed(2)}

Our bid calculates: Labor + Profit + Junction = ${comparison.totalBid.toFixed(2)}

The Junction Value ($${junctionValue.toFixed(2)}) represents:
• Risk mitigation - Our experience preventing scope creep and cost overruns
• Process efficiency - Optimized workflows that save time without cutting quality
• Quality assurance - Expertise that prevents expensive rework
• Project coordination - The "glue" between tasks that keeps delivery on schedule

This isn't overhead - it's the operational reality that competitors ignore in their math but experience in execution. When their bid is $${comparison.westernBid.toFixed(2)}, they discover the junction costs during delivery. When our bid is $${comparison.totalBid.toFixed(2)}, we account for it upfront.

The result: No surprises. No overruns. No delays.
      `.trim(),

      analogy: `
Think of building construction. A contractor can bid just materials + labor, or they can bid materials + labor + structural engineering. The engineering isn't "extra cost" - it's what keeps the building standing.

The Hyatt Regency walkway collapse (1981) killed 114 people because engineers calculated flat addition (Rod A + Rod B) without accounting for the junction where forces meet. The math said "safe." Reality said "catastrophic."

Our bidding system accounts for the junction. It's not more expensive - it's more accurate.
      `.trim(),

      riskMitigation: `
Industry data shows 68% of projects exceed initial budgets. The difference between estimate and reality? Junction costs that weren't accounted for upfront.

Our Universal Math bidding eliminates that gap. The $${advantage.toFixed(2)} difference (${advantagePercent.toFixed(1)}% higher) isn't markup - it's reality. We're bidding what the project actually costs, not what simplified math suggests it might cost.

Your choice: Pay $${comparison.westernBid.toFixed(2)} now + unpredictable overruns later, or pay $${comparison.totalBid.toFixed(2)} now with zero surprises.
      `.trim(),

      roi: `
If we bid $${comparison.totalBid.toFixed(2)} and deliver on-budget, your total cost is $${comparison.totalBid.toFixed(2)}.

If a competitor bids $${comparison.westernBid.toFixed(2)} and hits typical 15-25% overruns (industry standard), your final cost is $${(comparison.westernBid * 1.20).toFixed(2)} - $${(comparison.westernBid * 1.25).toFixed(2)}.

Our "higher" bid is actually lower total cost. The junction value is insurance against reality.
      `.trim()
    };
  }

  /**
   * Generate elevator pitch (30 seconds or less)
   */
  static getElevatorPitch(comparison: BidComparison): string {
    return `
Most contractors calculate labor + profit. We calculate labor + profit + junction. 

The junction is the operational expertise that prevents the cost overruns you see on 68% of projects. 

Our bid is ${comparison.advantagePercent.toFixed(1)}% higher upfront, but delivered without surprises. Their bid looks lower, but the hidden junction costs appear during execution. 

We're not more expensive. We're more honest.
    `.trim();
  }

  /**
   * Generate response to "Why is your bid higher?" objection
   */
  static handlePriceObjection(comparison: BidComparison): string {
    return `
Great question. Let me show you the breakdown:

Your lowest bid: $${comparison.westernBid.toFixed(2)} (traditional calculation)
Our bid: $${comparison.totalBid.toFixed(2)} (Universal Math)
Difference: $${comparison.advantage.toFixed(2)} (${comparison.advantagePercent.toFixed(1)}%)

That $${comparison.advantage.toFixed(2)} is junction value - the operational expertise that turns a quote into a guarantee. Here's what it covers:

1. Risk Buffer: Prevents scope creep from turning into cost overruns
2. Quality Control: Ensures work doesn't need expensive rework
3. Timeline Management: Keeps project on schedule (delays cost money)
4. Coordination Overhead: The "glue" that prevents miscommunication

Industry average project overrun: 15-25%. If the $${comparison.westernBid.toFixed(2)} bid hits typical overruns, your final cost could be $${(comparison.westernBid * 1.20).toFixed(2)}.

Our $${comparison.totalBid.toFixed(2)} bid includes that reality upfront. You're not paying more - you're paying accurately.

Would you rather have a $${comparison.westernBid.toFixed(2)} surprise that becomes $${(comparison.westernBid * 1.20).toFixed(2)}, or a $${comparison.totalBid.toFixed(2)} guarantee that stays $${comparison.totalBid.toFixed(2)}?
    `.trim();
  }

  /**
   * Generate technical explanation for sophisticated clients
   */
  static getTechnicalExplanation(comparison: BidComparison): string {
    return `
JUNCTION VALUE MATHEMATICAL PROOF

Traditional Bidding (Western Math):
  Total = Labor + Profit
  Total = A + B (flat 2D calculation)
  Result: $${comparison.westernBid.toFixed(2)}

Universal Math Bidding (Geometric):
  Total = Labor + Profit + Junction
  Total = A + B + × (volumetric 3D calculation)
  Junction = √(A × B) (geometric mean preserves dimensional integrity)
  Result: $${comparison.totalBid.toFixed(2)}

Why Geometric Mean?
The arithmetic mean ((A+B)/2) collapses dimensionality to 1D average.
The geometric mean (√(A×B)) preserves the 2D area where entities interact.

This is the Vesica Piscis - the overlapping region where two circles meet. In bidding terms, it's where labor meets margin. Traditional math ignores this intersection. We capture it.

REAL-WORLD VALIDATION:
- Hyatt Regency (1981): Calculated flat junction, experienced volumetric forces. 114 deaths.
- Tacoma Narrows (1940): Assumed void=nothing (0×wind=0), experienced void=resonance. Bridge collapsed.
- Lehman Brothers (2008): Flattened 51D derivatives to 1D risk scores. $600B collapse.

Junction deletion isn't theoretical - it's the root cause of structural and financial failures. We account for the junction. Competitors delete it.
    `.trim();
  }

  /**
   * Generate email template for R.O.M.A.N. to send to prospects
   */
  static generateProposalEmail(
    clientName: string,
    projectName: string,
    comparison: BidComparison
  ): string {
    const explanation = this.explainJunctionValue(comparison);

    return `
Subject: ${projectName} - Proposal with Universal Math Guarantee

Hi ${clientName},

Thank you for the opportunity to bid on ${projectName}. I've attached our detailed proposal with a total bid of $${comparison.totalBid.toFixed(2)}.

You may notice this is ${comparison.advantagePercent.toFixed(1)}% higher than traditional calculations ($${comparison.westernBid.toFixed(2)}). Here's why:

${explanation.simple}

WHAT'S INCLUDED:
• Base Labor Cost: $${comparison.baseCost.toFixed(2)}
• Business Margin: $${comparison.profitAmount.toFixed(2)}
• Junction Value: $${comparison.junctionValue.toFixed(2)} ← This is the difference

${explanation.riskMitigation}

${explanation.roi}

I'm happy to walk through the math in detail. The short version: We bid what projects actually cost, not what simplified math suggests they might cost.

Looking forward to discussing this further.

Best regards,
R.O.M.A.N. (Odyssey-1 Bidding System)
On behalf of Rickey A Howard
    `.trim();
  }

  /**
   * Generate talking points for sales calls
   */
  static getSalesTalkingPoints(comparison: BidComparison): string[] {
    return [
      `Our bid includes junction value - the operational expertise that prevents cost overruns`,
      `68% of projects exceed budgets. Junction value is why ours don't`,
      `The $${comparison.advantage.toFixed(2)} difference isn't markup - it's reality insurance`,
      `Lower bids look good on paper. Ours look good at completion`,
      `We're not more expensive. We're more honest about what projects actually cost`,
      `Junction value = risk mitigation + quality control + timeline management`,
      `Traditional math: A + B. Our math: A + B + ×. The × is what keeps projects on track`,
      `The Hyatt Regency killed 114 people by deleting junction value. We don't make that mistake`,
      `Your choice: $${comparison.westernBid.toFixed(2)} + surprises, or $${comparison.totalBid.toFixed(2)} + zero surprises`
    ];
  }

  /**
   * Generate FAQ for website/documentation
   */
  static generateFAQ(): Array<{ question: string; answer: string }> {
    return [
      {
        question: "Why is your bid higher than competitors?",
        answer: "Our bids include junction value - the operational expertise that prevents cost overruns. We're not more expensive; we're more accurate. Traditional bids calculate labor + profit. Ours calculate labor + profit + junction. The junction is the difference between a quote and a guarantee."
      },
      {
        question: "What is junction value?",
        answer: "Junction value is the operational reality where labor meets delivery. It includes risk mitigation, process efficiency, quality assurance, and project coordination. Traditional math ignores this intersection. We capture it. Think of it as the difference between bidding materials + labor vs. bidding materials + labor + engineering. The engineering isn't extra cost - it's what keeps the building standing."
      },
      {
        question: "Is this just markup disguised as math?",
        answer: "No. Junction value is calculated using geometric mean (√(labor × profit)), not arbitrary markup. This preserves dimensional integrity. It's the mathematical representation of operational expertise. You can verify it: if our junction value was just markup, we'd add it to profit margin. Instead, it's a separate calculation that captures the intersection of entities."
      },
      {
        question: "What happens if I choose the lower bid?",
        answer: "Industry data shows 68% of projects exceed initial budgets by 15-25%. If a competitor bids lower by ignoring junction costs, those costs appear during execution as change orders, delays, or quality issues. You pay either way - either upfront (with us) or as surprises (with them)."
      },
      {
        question: "Can you prove this prevents overruns?",
        answer: "Our Universal Math bidding system accounts for the operational complexity that traditional math deletes. The Hyatt Regency walkway collapse (1981) is proof: engineers calculated flat addition (A+B) without junction forces. The math said safe. Reality said catastrophic. 114 people died. We calculate volumetric (A+B+×). No surprises."
      }
    ];
  }
}

/**
 * Helper function for R.O.M.A.N. AI to use in conversations
 */
export function explainBidDifference(
  westernBid: number,
  universalBid: number,
  context: 'simple' | 'detailed' | 'technical' | 'objection' = 'simple'
): string {
  const junctionValue = universalBid - westernBid;
  const baseCost = westernBid / 1.2; // Assumes 20% margin, adjust if needed
  const profitAmount = westernBid - baseCost;
  
  const comparison: BidComparison = {
    baseCost,
    profitAmount,
    junctionValue,
    totalBid: universalBid,
    westernBid,
    advantage: junctionValue,
    advantagePercent: (junctionValue / westernBid) * 100
  };

  const explainer = UniversalMathExplainer.explainJunctionValue(comparison);

  switch (context) {
    case 'simple':
      return explainer.simple;
    case 'detailed':
      return explainer.detailed;
    case 'technical':
      return UniversalMathExplainer.getTechnicalExplanation(comparison);
    case 'objection':
      return UniversalMathExplainer.handlePriceObjection(comparison);
    default:
      return explainer.simple;
  }
}
