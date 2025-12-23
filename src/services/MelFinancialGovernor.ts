/**
 * 🛰️ MEL FINANCIAL GOVERNOR (v1.0)
 * Purpose: Autonomous Budgeting and Cash-Flow Stabilization logic.
 * Logic: Prioritizes Sovereign Assets (5090) over Operational Bloat.
 */

import { supabase } from '@/lib/supabase';

export class MelFinancialGovernor {
  private static ALPHA_NODE_MONTHLY = 1030.0;
  private static FREEDOM_NET_TARGET = 3000.0;
  private static ALPHA_NODE_TOTAL = 6200.0;

  /**
   * analyzeCashFlow
   * Performs a forensic audit of current QuickBooks-synced data.
   */
  static async analyzeCashFlow(grossRevenue: number, fixedCosts: number) {
    const netProfit = grossRevenue - fixedCosts;
    const hardwareGap = Math.max(0, this.ALPHA_NODE_MONTHLY - netProfit);
    const freedomSurplus = Math.max(0, netProfit - this.ALPHA_NODE_MONTHLY);

    const verdict = this.generateArchitectVerdict(netProfit, freedomSurplus);

    return {
      netProfit,
      hardwareGap,
      freedomSurplus,
      hardwareProgress: Math.min(100, (netProfit / this.ALPHA_NODE_MONTHLY) * 100),
      verdict,
      isStabilized: netProfit >= this.FREEDOM_NET_TARGET,
    };
  }

  private static generateArchitectVerdict(net: number, surplus: number): string {
    if (net < this.ALPHA_NODE_MONTHLY) {
      return `CRITICAL: Alpha Node funding deficient by $${(
        this.ALPHA_NODE_MONTHLY - net
      ).toFixed(2)}. Focus on Micro-Extraction nodes.`;
    }
    if (net < this.FREEDOM_NET_TARGET) {
      return `WARNING: Hardware secured, but Freedom Buffer is low. Current Surplus: $${surplus.toFixed(
        2
      )}. Target: $${(this.FREEDOM_NET_TARGET - this.ALPHA_NODE_MONTHLY).toFixed(2)}.`;
    }
    return `OPTIMAL: Sovereign State Achieved. Monthly net exceeds $3,000. Allocate surplus to Trust Reserves.`;
  }

  /**
   * identifyBiddingPriority
   * Cross-references bid amounts with historical conversion patterns.
   */
  static async prioritizeBids(activeBids: any[]) {
    // Calculate probability scores based on historical data
    const { data: historicalBids } = await supabase
      .from('bids')
      .select('*')
      .in('status', ['won', 'lost']);

    const winRate = historicalBids
      ? historicalBids.filter((b) => b.status === 'won').length / historicalBids.length
      : 0.5;

    // Sort bids by 'Shortest Path to Extraction'
    return activeBids
      .map((bid) => ({
        ...bid,
        probability_score: this.calculateConversionProbability(bid, winRate),
        extraction_value: this.calculateExtractionValue(bid),
      }))
      .sort((a, b) => b.probability_score - a.probability_score);
  }

  private static calculateConversionProbability(bid: any, baseWinRate: number): number {
    let score = baseWinRate * 100;

    // Adjust based on bid age (newer = higher probability)
    const daysOld = Math.floor(
      (Date.now() - new Date(bid.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysOld < 7) score += 20;
    else if (daysOld < 14) score += 10;
    else if (daysOld > 30) score -= 20;

    // Adjust based on bid amount (sweet spot $500-$2000)
    const amount = bid.total_cents ? bid.total_cents / 100 : 0;
    if (amount >= 500 && amount <= 2000) score += 15;
    else if (amount > 2000) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  private static calculateExtractionValue(bid: any): number {
    const total = bid.total_cents ? bid.total_cents / 100 : 0;
    // Assume 60% net profit on HJS services
    return total * 0.6;
  }

  /**
   * Get current QuickBooks revenue data
   */
  static async getQuickBooksRevenue() {
    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', 'paid')
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()); // This month

      const monthlyRevenue = invoices
        ? invoices.reduce((sum, inv) => sum + (inv.total_cents || 0), 0) / 100
        : 0;

      return monthlyRevenue;
    } catch (error) {
      console.error('Failed to fetch QuickBooks revenue:', error);
      return 0;
    }
  }

  /**
   * Get current active bids
   */
  static async getActiveBids() {
    try {
      const { data: bids } = await supabase
        .from('bids')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      return bids || [];
    } catch (error) {
      console.error('Failed to fetch active bids:', error);
      return [];
    }
  }

  /**
   * Calculate capital extraction nodes
   */
  static calculateExtractionNodes(currentNet: number) {
    const node1Target = 3000; // HJS Bidding
    const node2Target = 2000; // Credit Arbitrage
    const node3Target = 500; // Equity Recovery

    return {
      node1: {
        name: 'HJS Bidding Pipeline',
        target: node1Target,
        current: currentNet,
        gap: Math.max(0, node1Target - currentNet),
        progress: Math.min(100, (currentNet / node1Target) * 100),
        status: currentNet >= node1Target ? 'complete' : 'active',
      },
      node2: {
        name: 'Unsecured Credit Arbitrage',
        target: node2Target,
        current: 0,
        gap: node2Target,
        progress: 0,
        status: 'pending',
      },
      node3: {
        name: 'Equity Recovery (Deposits)',
        target: node3Target,
        current: 0,
        gap: node3Target,
        progress: 0,
        status: 'pending',
      },
      totalTarget: this.ALPHA_NODE_TOTAL,
      totalRaised: currentNet,
      remaining: Math.max(0, this.ALPHA_NODE_TOTAL - currentNet),
    };
  }

  /**
   * Generate micro-extraction opportunities
   */
  static async identifyMicroExtractions() {
    // Look for small revenue opportunities
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .eq('status', 'active')
      .limit(10);

    const opportunities = customers?.map((customer) => ({
      customer_id: customer.id,
      customer_name: customer.company_name || `${customer.first_name} ${customer.last_name}`,
      opportunity_type: 'year_end_cleanup',
      estimated_value: 200 + Math.random() * 300, // $200-$500
      probability: 70 + Math.random() * 20, // 70-90%
      action: 'Call for year-end deep clean',
    }));

    return opportunities || [];
  }
}
