/**
 * Insurance Gap Analyzer
 * 
 * Analyzes debt accounts against insurance coverage to identify protection gaps.
 * Recommends specific additional policies needed (D&O, EPLI, Umbrella).
 * 
 * Critical Coverage Gaps:
 * - Personal guarantees = NOT covered by CGL
 * - Contractual liability = NOT covered by CGL
 * - Employment claims = NOT covered by CGL
 * 
 * Created: January 17, 2026
 */

import { supabase } from '@/lib/supabaseClient';

interface InsurancePolicy {
  id: string;
  policy_number: string;
  policy_type: 'general_liability' | 'directors_officers' | 'epli' | 'umbrella' | 'cyber' | 'professional_liability';
  coverage_limit: number;
  includes_legal_defense: boolean;
  covered_entities: string[]; // ['HJS SERVICES LLC', 'ODYSSEY-1 AI LLC', etc.]
  excludes_personal_guarantees: boolean;
  excludes_contractual_liability: boolean;
  policy_period_start: string;
  policy_period_end: string;
}

interface DebtAccount {
  id: string;
  creditor: string;
  current_amount: number;
  debtor_entity: string; // 'HJS SERVICES LLC', 'Rickey Allan Howard (Personal)', etc.
  personal_guarantee: boolean;
  claim_type: 'tort' | 'contract' | 'employment' | 'other';
}

interface CoverageGap {
  debt_id: string;
  creditor: string;
  amount: number;
  gap_type: 'no_coverage' | 'personal_guarantee_excluded' | 'contractual_liability_excluded' | 'entity_not_covered';
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  recommended_policy: string;
  estimated_annual_premium: number;
  reasoning: string;
}

interface InsuranceGapAnalysis {
  total_debt_analyzed: number;
  total_covered_debt: number;
  total_uncovered_debt: number;
  coverage_percentage: number;
  gaps: CoverageGap[];
  recommended_policies: {
    policy_type: string;
    coverage_limit: number;
    estimated_premium: number;
    debts_it_covers: string[];
    total_debt_protected: number;
    priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

export class InsuranceGapAnalyzer {
  
  /**
   * Main analysis: Check all debts against all policies, identify gaps
   */
  async analyzeInsuranceGaps(userId: string): Promise<InsuranceGapAnalysis> {
    
    // Get all insurance policies
    const { data: policies } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId);

    // Get all debt accounts (both personal and business)
    const { data: personalDebts } = await supabase
      .from('legal_defense_accounts')
      .select('*')
      .eq('user_id', userId);

    const { data: businessDebts } = await supabase
      .from('business_debt_accounts')
      .select('*')
      .eq('user_id', userId);

    const allDebts = [
      ...(personalDebts || []).map(d => ({
        id: d.id,
        creditor: d.creditor,
        current_amount: parseFloat(d.current_amount),
        debtor_entity: 'Rickey Allan Howard (Personal)',
        personal_guarantee: false, // Personal debt IS the guarantee
        claim_type: 'contract' as const
      })),
      ...(businessDebts || []).map(d => ({
        id: d.id,
        creditor: d.creditor,
        current_amount: parseFloat(d.current_amount),
        debtor_entity: d.business_entity_id || 'HJS SERVICES LLC',
        personal_guarantee: d.personal_guarantee || false,
        claim_type: 'contract' as const
      }))
    ];

    const gaps: CoverageGap[] = [];
    let totalCovered = 0;
    let totalUncovered = 0;

    // Analyze each debt
    for (const debt of allDebts) {
      const coverage = this.checkCoverage(debt, policies || []);
      
      if (!coverage.isCovered) {
        gaps.push({
          debt_id: debt.id,
          creditor: debt.creditor,
          amount: debt.current_amount,
          gap_type: coverage.gapType,
          severity: coverage.severity,
          recommended_policy: coverage.recommendedPolicy,
          estimated_annual_premium: coverage.estimatedPremium,
          reasoning: coverage.reasoning
        });
        totalUncovered += debt.current_amount;
      } else {
        totalCovered += debt.current_amount;
      }
    }

    // Generate policy recommendations
    const recommendations = this.generatePolicyRecommendations(gaps);

    const totalDebt = totalCovered + totalUncovered;
    
    return {
      total_debt_analyzed: totalDebt,
      total_covered_debt: totalCovered,
      total_uncovered_debt: totalUncovered,
      coverage_percentage: totalDebt > 0 ? (totalCovered / totalDebt) * 100 : 0,
      gaps,
      recommended_policies: recommendations
    };
  }

  /**
   * Check if a specific debt is covered by any policy
   */
  private checkCoverage(debt: DebtAccount, policies: InsurancePolicy[]): {
    isCovered: boolean;
    gapType: CoverageGap['gap_type'];
    severity: CoverageGap['severity'];
    recommendedPolicy: string;
    estimatedPremium: number;
    reasoning: string;
  } {
    
    // Check for CGL coverage
    const cglPolicy = policies.find(p => p.policy_type === 'general_liability');
    
    // Personal guarantee = NOT covered by CGL
    if (debt.personal_guarantee) {
      return {
        isCovered: false,
        gapType: 'personal_guarantee_excluded',
        severity: 'CRITICAL',
        recommendedPolicy: 'Directors & Officers (D&O) Insurance',
        estimatedPremium: 1500,
        reasoning: 'CGL policy excludes contractual liability and personal guarantees. D&O insurance covers officers/directors sued personally for business decisions, including personal guarantees.'
      };
    }

    // Personal debt (not through entity) = NOT covered
    if (debt.debtor_entity.includes('Personal')) {
      return {
        isCovered: false,
        gapType: 'entity_not_covered',
        severity: 'CRITICAL',
        recommendedPolicy: 'Personal Umbrella Insurance + D&O',
        estimatedPremium: 2000,
        reasoning: 'Personal debts are not covered by business CGL policy. Personal umbrella provides excess liability coverage, and D&O covers guarantees made in business capacity.'
      };
    }

    // Business debt but entity not listed in policy
    if (cglPolicy && !cglPolicy.covered_entities.includes(debt.debtor_entity)) {
      return {
        isCovered: false,
        gapType: 'entity_not_covered',
        severity: 'HIGH',
        recommendedPolicy: 'Add Entity to CGL Policy (Endorsement)',
        estimatedPremium: 100,
        reasoning: `${debt.debtor_entity} is not listed as a Named Insured or Additional Insured on CGL policy. Request endorsement to add entity.`
      };
    }

    // Contract liability = Generally NOT covered by CGL
    if (debt.claim_type === 'contract') {
      // Check if CGL explicitly excludes contractual liability
      if (cglPolicy?.excludes_contractual_liability) {
        return {
          isCovered: false,
          gapType: 'contractual_liability_excluded',
          severity: 'HIGH',
          recommendedPolicy: 'Commercial Umbrella Policy',
          estimatedPremium: 800,
          reasoning: 'Debt collection lawsuits are breach of contract claims, excluded by CGL "Contractual Liability" exclusion. Umbrella policies may provide broader coverage.'
        };
      }
    }

    // Employment claims = NOT covered by CGL
    if (debt.claim_type === 'employment') {
      return {
        isCovered: false,
        gapType: 'no_coverage',
        severity: 'HIGH',
        recommendedPolicy: 'Employment Practices Liability Insurance (EPLI)',
        estimatedPremium: 1200,
        reasoning: 'Employment-related claims (wrongful termination, discrimination, harassment) are explicitly excluded from CGL coverage. EPLI is required.'
      };
    }

    // If we get here, likely NOT covered (debt collection = contract claim)
    // But check if D&O policy exists
    const dAndOPolicy = policies.find(p => p.policy_type === 'directors_officers');
    if (dAndOPolicy) {
      return {
        isCovered: true,
        gapType: 'no_coverage',
        severity: 'LOW',
        recommendedPolicy: 'Current D&O Policy',
        estimatedPremium: 0,
        reasoning: 'Covered by existing D&O insurance policy.'
      };
    }

    // Default: assume NOT covered (most debt claims are contract-based)
    return {
      isCovered: false,
      gapType: 'contractual_liability_excluded',
      severity: 'HIGH',
      recommendedPolicy: 'Directors & Officers (D&O) Insurance',
      estimatedPremium: 1500,
      reasoning: 'Business debt claims are typically breach of contract, excluded by CGL. D&O insurance provides defense coverage for business liability claims.'
    };
  }

  /**
   * Generate policy recommendations based on identified gaps
   */
  private generatePolicyRecommendations(gaps: CoverageGap[]): InsuranceGapAnalysis['recommended_policies'] {
    
    const recommendations = new Map<string, {
      policy_type: string;
      coverage_limit: number;
      estimated_premium: number;
      debts: Set<string>;
      total_debt: number;
      priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
    }>();

    // Group gaps by recommended policy
    for (const gap of gaps) {
      if (!recommendations.has(gap.recommended_policy)) {
        recommendations.set(gap.recommended_policy, {
          policy_type: gap.recommended_policy,
          coverage_limit: 1000000, // Default $1M
          estimated_premium: gap.estimated_annual_premium,
          debts: new Set(),
          total_debt: 0,
          priority: 'MEDIUM'
        });
      }

      const rec = recommendations.get(gap.recommended_policy)!;
      rec.debts.add(gap.creditor);
      rec.total_debt += gap.amount;
      
      // Upgrade priority if severity is CRITICAL
      if (gap.severity === 'CRITICAL' && rec.priority !== 'URGENT') {
        rec.priority = 'URGENT';
      } else if (gap.severity === 'HIGH' && rec.priority === 'MEDIUM') {
        rec.priority = 'HIGH';
      }
    }

    // Convert to array and sort by priority
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    
    return Array.from(recommendations.values())
      .map(rec => ({
        policy_type: rec.policy_type,
        coverage_limit: rec.coverage_limit,
        estimated_premium: rec.estimated_premium,
        debts_it_covers: Array.from(rec.debts),
        total_debt_protected: rec.total_debt,
        priority: rec.priority
      }))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Calculate estimated cost to close all coverage gaps
   */
  calculateTotalGapCost(analysis: InsuranceGapAnalysis): {
    total_annual_premium: number;
    total_debt_protected: number;
    roi_percentage: number;
  } {
    const totalPremium = analysis.recommended_policies.reduce((sum, p) => sum + p.estimated_premium, 0);
    const totalDebtProtected = analysis.total_uncovered_debt;
    const roi = totalDebtProtected > 0 ? (totalDebtProtected / totalPremium) * 100 : 0;

    return {
      total_annual_premium: totalPremium,
      total_debt_protected: totalDebtProtected,
      roi_percentage: roi
    };
  }
}

export const insuranceGapAnalyzer = new InsuranceGapAnalyzer();
