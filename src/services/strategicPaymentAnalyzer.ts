/**
 * Strategic Payment Plan Analyzer
 * 
 * Calculates optimal debt payment strategies case-by-case:
 * - When paying is better than fighting
 * - Payment timeline optimization
 * - Debt prioritization (interest, statute timing, credit impact)
 * - Total cost comparison: Pay vs Settle vs Fight
 * 
 * "Sometimes the best strategy is to pay. Know when."
 * 
 * Created: January 17, 2026
 */

import { supabase } from '@/lib/supabaseClient';

interface DebtAccount {
  id: string;
  creditor: string;
  originalAmount: number;
  currentAmount: number;
  interestRate: number; // APR as decimal (0.18 = 18%)
  lastPaymentDate: Date;
  dateOfDefault: Date;
  accountType: 'credit_card' | 'loan' | 'medical' | 'utility' | 'other';
  statuteExpired: boolean;
  defenseStrength: number; // 0-100%
  monthlyCashFlow?: number; // Available to pay this debt monthly
}

interface PaymentStrategy {
  strategy: 'PAY_FULL' | 'PAY_PLAN' | 'SETTLE' | 'FIGHT' | 'IGNORE';
  reasoning: string;
  totalCost: number;
  timelineMonths: number;
  monthlyPayment?: number;
  estimatedCreditImpact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  legalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction: string;
  costComparison: {
    payFull: number;
    payPlan: number;
    settle: number;
    fight: number;
  };
  priorityScore: number; // 0-100, higher = pay first
}

interface PaymentPlan {
  totalMonthlyPayment: number;
  totalDebt: number;
  payoffMonths: number;
  totalInterestPaid: number;
  debtsByPriority: Array<{
    debt: DebtAccount;
    strategy: PaymentStrategy;
    monthlyPayment: number;
    order: number; // 1 = pay first
  }>;
  alternativeStrategies: {
    settleAll: { cost: number; months: number };
    fightAll: { cost: number; months: number };
    mixedStrategy: { cost: number; months: number };
  };
}

export class StrategicPaymentAnalyzer {
  /**
   * Analyze optimal strategy for a single debt
   */
  analyzeDebtStrategy(debt: DebtAccount, availableCashFlow: number): PaymentStrategy {
    const costComparison = this.calculateCostComparison(debt);
    
    // Decision tree logic
    let strategy: PaymentStrategy['strategy'];
    let reasoning: string;
    let totalCost: number;
    let timelineMonths: number;
    let monthlyPayment: number | undefined;
    let creditImpact: PaymentStrategy['estimatedCreditImpact'];
    let legalRisk: PaymentStrategy['legalRisk'];
    
    // Rule 1: If statute expired, NEVER pay
    if (debt.statuteExpired) {
      strategy = 'IGNORE';
      reasoning = 'Statute of limitations expired. Debt is legally unenforceable. DO NOT acknowledge or pay - it would restart the statute clock.';
      totalCost = 0;
      timelineMonths = 0;
      creditImpact = 'NEUTRAL';
      legalRisk = 'LOW';
    }
    // Rule 2: If defense strength > 80%, FIGHT
    else if (debt.defenseStrength > 80) {
      strategy = 'FIGHT';
      reasoning = `High defense strength (${debt.defenseStrength}%). Legal defenses likely to succeed. Fighting costs less than paying.`;
      totalCost = costComparison.fight;
      timelineMonths = 6; // Average legal timeline
      creditImpact = 'NEUTRAL';
      legalRisk = 'LOW';
    }
    // Rule 3: If debt < $1000 and cash available, PAY FULL
    else if (debt.currentAmount < 1000 && availableCashFlow >= debt.currentAmount) {
      strategy = 'PAY_FULL';
      reasoning = 'Small debt, cash available. Paying removes liability immediately and improves credit.';
      totalCost = debt.currentAmount;
      timelineMonths = 1;
      monthlyPayment = debt.currentAmount;
      creditImpact = 'POSITIVE';
      legalRisk = 'LOW';
    }
    // Rule 4: If cash flow can pay in < 12 months, PAY PLAN
    else if (availableCashFlow > 0 && (debt.currentAmount / availableCashFlow) < 12) {
      const months = Math.ceil(debt.currentAmount / availableCashFlow);
      strategy = 'PAY_PLAN';
      reasoning = `Cash flow supports ${months}-month payment plan. Paying avoids legal fees and rebuilds credit.`;
      totalCost = costComparison.payPlan;
      timelineMonths = months;
      monthlyPayment = debt.currentAmount / months;
      creditImpact = 'POSITIVE';
      legalRisk = 'LOW';
    }
    // Rule 5: If settlement saves > 40%, SETTLE
    else if ((debt.currentAmount - costComparison.settle) / debt.currentAmount > 0.40) {
      strategy = 'SETTLE';
      reasoning = `Settlement saves ${Math.round(((debt.currentAmount - costComparison.settle) / debt.currentAmount) * 100)}%. Best financial outcome.`;
      totalCost = costComparison.settle;
      timelineMonths = 3; // Average settlement timeline
      creditImpact = 'NEUTRAL';
      legalRisk = 'LOW';
    }
    // Rule 6: If defense strength 50-80% and fighting cheaper, FIGHT
    else if (debt.defenseStrength >= 50 && costComparison.fight < costComparison.settle) {
      strategy = 'FIGHT';
      reasoning = `Moderate defense strength (${debt.defenseStrength}%). Fighting costs less than settling/paying.`;
      totalCost = costComparison.fight;
      timelineMonths = 6;
      creditImpact = 'NEGATIVE';
      legalRisk = 'MEDIUM';
    }
    // Rule 7: Default to SETTLE
    else {
      strategy = 'SETTLE';
      reasoning = 'Settlement balances cost reduction with credit preservation. Best middle ground.';
      totalCost = costComparison.settle;
      timelineMonths = 3;
      creditImpact = 'NEUTRAL';
      legalRisk = 'LOW';
    }
    
    const priorityScore = this.calculatePriorityScore(debt, strategy);
    
    return {
      strategy,
      reasoning,
      totalCost,
      timelineMonths,
      monthlyPayment,
      estimatedCreditImpact: creditImpact,
      legalRisk,
      recommendedAction: this.generateActionPlan(debt, strategy, monthlyPayment),
      costComparison,
      priorityScore
    };
  }
  
  /**
   * Calculate total cost for each strategy option
   */
  private calculateCostComparison(debt: DebtAccount) {
    // Pay Full: Current balance + accrued interest over 12 months
    const monthlyInterest = debt.interestRate / 12;
    const payFull = debt.currentAmount;
    
    // Pay Plan (12 months): Balance + interest over payment period
    let payPlanBalance = debt.currentAmount;
    let totalInterest = 0;
    for (let month = 0; month < 12; month++) {
      const interest = payPlanBalance * monthlyInterest;
      totalInterest += interest;
      payPlanBalance -= (debt.currentAmount / 12);
    }
    const payPlan = debt.currentAmount + totalInterest;
    
    // Settle: Typical 40-60% of balance
    const settlePercent = debt.currentAmount > 5000 ? 0.40 : 0.50;
    const settle = debt.currentAmount * settlePercent;
    
    // Fight: Legal costs (if you lose, pay full + fees; if you win, just legal costs)
    const legalCostEstimate = 1500; // Average attorney consultation + motions
    const winProbability = debt.defenseStrength / 100;
    const fight = (legalCostEstimate * 1) + (debt.currentAmount * (1 - winProbability));
    
    return { payFull, payPlan, settle, fight };
  }
  
  /**
   * Calculate priority score (0-100, higher = pay first)
   */
  private calculatePriorityScore(debt: DebtAccount, strategy: PaymentStrategy['strategy']): number {
    let score = 0;
    
    // Factor 1: Interest rate (max 30 points)
    score += Math.min(debt.interestRate * 100, 30);
    
    // Factor 2: Statute timing (max 20 points)
    const daysSinceDefault = (Date.now() - debt.dateOfDefault.getTime()) / (1000 * 60 * 60 * 24);
    const georgiaSOL = 6 * 365; // 6 years in days
    const daysUntilExpiry = georgiaSOL - daysSinceDefault;
    if (daysUntilExpiry > 730) { // > 2 years left
      score += 20; // High priority, fresh debt
    } else if (daysUntilExpiry > 365) {
      score += 10;
    } else {
      score += 0; // Low priority, almost expired
    }
    
    // Factor 3: Credit impact (max 25 points)
    if (debt.accountType === 'credit_card') {
      score += 25; // High credit impact
    } else if (debt.accountType === 'loan') {
      score += 15;
    } else if (debt.accountType === 'medical') {
      score += 5; // Low credit impact
    }
    
    // Factor 4: Strategy type (max 25 points)
    if (strategy === 'PAY_FULL') {
      score += 25; // Highest priority - can pay immediately
    } else if (strategy === 'PAY_PLAN') {
      score += 20; // High priority - can afford
    } else if (strategy === 'SETTLE') {
      score += 10; // Medium priority
    } else if (strategy === 'FIGHT') {
      score += 5; // Lower priority
    } else {
      score += 0; // IGNORE = lowest priority
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * Generate step-by-step action plan
   */
  private generateActionPlan(debt: DebtAccount, strategy: PaymentStrategy['strategy'], monthlyPayment?: number): string {
    switch (strategy) {
      case 'PAY_FULL':
        return `1. Contact ${debt.creditor} and request payoff statement\n2. Negotiate "Paid in Full" credit reporting (not "settled")\n3. Pay via cashier's check or money order\n4. Get written confirmation of payment and credit reporting\n5. Monitor credit report to verify removal`;
      
      case 'PAY_PLAN':
        return `1. Offer ${monthlyPayment?.toFixed(0)}/month payment plan to ${debt.creditor}\n2. Demand written agreement: No lawsuits during plan, "Paid as Agreed" credit reporting\n3. Set up automatic payments (NOT ACH - they can't withdraw extra)\n4. Keep all payment receipts\n5. Monitor credit report monthly`;
      
      case 'SETTLE':
        return `1. Save cash for settlement (target 40-50% of balance)\n2. Wait for written settlement offer or make offer\n3. Demand "Paid in Full" reporting and no 1099-C tax form\n4. Get written agreement BEFORE paying\n5. Pay via cashier's check only\n6. Keep all documentation forever`;
      
      case 'FIGHT':
        return `1. Send debt validation letter (certified mail)\n2. Dispute with credit bureaus\n3. Document all FDCPA violations\n4. If sued, file Answer with affirmative defenses\n5. Counterclaim for FDCPA violations ($1,000 + fees)\n6. Force discovery - make them prove standing`;
      
      case 'IGNORE':
        return `1. DO NOT contact creditor or acknowledge debt\n2. DO NOT make any payments (resets statute clock)\n3. If contacted, send cease & desist letter\n4. If sued, file Motion to Dismiss (statute of limitations defense)\n5. Monitor credit report - dispute if reported as current\n6. Document all violations for counterclaim`;
      
      default:
        return 'Unknown strategy';
    }
  }
  
  /**
   * Create comprehensive payment plan for all debts
   */
  async createPaymentPlan(userId: string, totalMonthlyCashFlow: number): Promise<PaymentPlan> {
    // Load all debts from database (remove user_id filter since table doesn't have that column)
    const { data: debtData, error } = await supabase
      .from('legal_defense_accounts')
      .select('*');
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    if (!debtData || debtData.length === 0) {
      // Return empty plan if no debts
      return {
        totalMonthlyPayment: 0,
        totalDebt: 0,
        payoffMonths: 0,
        totalInterestPaid: 0,
        debtsByPriority: [],
        alternativeStrategies: {
          settleAll: { cost: 0, months: 0 },
          fightAll: { cost: 0, months: 0 },
          mixedStrategy: { cost: 0, months: 0 }
        }
      };
    }
    
    const debts: DebtAccount[] = (debtData || []).map(row => ({
      id: row.id,
      creditor: row.creditor,
      originalAmount: parseFloat(row.original_amount),
      currentAmount: parseFloat(row.current_amount),
      interestRate: row.interest_rate || 0.18, // Default 18% if unknown
      lastPaymentDate: new Date(row.last_payment_date),
      dateOfDefault: new Date(row.date_of_default),
      accountType: row.account_type || 'other',
      statuteExpired: row.statute_expired,
      defenseStrength: row.defense_strength
    }));
    
    // Analyze each debt
    const strategies = debts.map(debt => ({
      debt,
      strategy: this.analyzeDebtStrategy(debt, totalMonthlyCashFlow / debts.length),
      monthlyPayment: 0,
      order: 0
    }));
    
    // Sort by priority score (highest first)
    strategies.sort((a, b) => b.strategy.priorityScore - a.strategy.priorityScore);
    
    // Allocate cash flow based on priority
    let remainingCashFlow = totalMonthlyCashFlow;
    let totalDebt = 0;
    let totalInterestPaid = 0;
    
    strategies.forEach((item, index) => {
      item.order = index + 1;
      totalDebt += item.debt.currentAmount;
      
      if (item.strategy.strategy === 'PAY_FULL' || item.strategy.strategy === 'PAY_PLAN') {
        const payment = Math.min(item.strategy.monthlyPayment || 0, remainingCashFlow);
        item.monthlyPayment = payment;
        remainingCashFlow -= payment;
        
        // Calculate interest
        const months = item.strategy.timelineMonths;
        totalInterestPaid += (item.strategy.totalCost - item.debt.currentAmount);
      }
    });
    
    // Calculate total payoff time (longest timeline)
    const payoffMonths = Math.max(...strategies.map(s => s.strategy.timelineMonths));
    
    // Calculate alternative strategies
    const settleAllCost = strategies.reduce((sum, s) => sum + s.strategy.costComparison.settle, 0);
    const fightAllCost = strategies.reduce((sum, s) => sum + s.strategy.costComparison.fight, 0);
    
    // Mixed strategy: Fight high-defense debts, settle/pay the rest
    const mixedCost = strategies.reduce((sum, s) => {
      if (s.debt.defenseStrength > 70) return sum + s.strategy.costComparison.fight;
      if (s.debt.currentAmount < 1000) return sum + s.debt.currentAmount;
      return sum + s.strategy.costComparison.settle;
    }, 0);
    
    return {
      totalMonthlyPayment: totalMonthlyCashFlow - remainingCashFlow,
      totalDebt,
      payoffMonths,
      totalInterestPaid,
      debtsByPriority: strategies,
      alternativeStrategies: {
        settleAll: { cost: settleAllCost, months: 3 },
        fightAll: { cost: fightAllCost, months: 12 },
        mixedStrategy: { cost: mixedCost, months: 6 }
      }
    };
  }
}

export const strategicPaymentAnalyzer = new StrategicPaymentAnalyzer();
