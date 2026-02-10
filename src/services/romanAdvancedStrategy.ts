/**
 * R.O.M.A.N. Advanced Asset Protection & Legal Strategy Engine
 * 
 * Integrates legitimate legal tools for maximum debt defense:
 * - UCC-1 Financing Statements (secure IP/assets)
 * - Trust Structures (asset protection)
 * - Insurance Policies (legal defense coverage, D&O, umbrella)
 * - LLC/Corporate Formalities (veil protection)
 * - Patent & IP Holdings (secured assets)
 * 
 * USES ONLY LEGITIMATE LAW - NO PSEUDOLAW
 */

import { supabase } from '@/lib/supabaseClient';

export interface AssetProtectionStrategy {
  // Overall Strategy
  overallApproach: string;
  defenseStrength: number; // 0-100%
  estimatedCost: number;
  timeToImplement: string;
  
  // Layer 1: Corporate Structure
  corporateShield: {
    hasLLC: boolean;
    hasMultipleLLCs: boolean;
    corporateFormalities: boolean;
    personalGuarantees: string[];
    veilPiercingRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendations: string[];
  };
  
  // Layer 2: Trust Protection
  trustProtection: {
    hasTrusts: boolean;
    trustTypes: string[];
    trustNames: string[];
    trustIds: string[];
    assetsInTrust: string[];
    revocableVsIrrevocable: string;
    creditorProtection: boolean;
    recommendations: string[];
  };
  
  // Layer 3: UCC-1 Secured Assets
  uccSecuredAssets: {
    hasUCCFilings: boolean;
    securedAssets: string[];
    uccFilingNumbers: string[];
    protectionLevel: 'FULL' | 'PARTIAL' | 'NONE';
    recommendations: string[];
  };
  
  // Layer 4: Insurance Coverage
  insuranceCoverage: {
    legalDefenseCoverage: boolean;
    dAndOInsurance: boolean;
    umbrellaPolicy: boolean;
    commercialLiability: boolean;
    estimatedCoverageLimit: number;
    canAffordLitigation: boolean;
    recommendations: string[];
  };
  
  // Layer 5: Bankruptcy Shield
  bankruptcyAnalysis: {
    dischargeable: boolean;
    exemptAssets: string[];
    nonExemptAssets: string[];
    chapter7Eligible: boolean;
    chapter13Eligible: boolean;
    preferredChapter: number | null;
    recommendations: string[];
  };
  
  // Tactical Recommendations
  immediateActions: string[];
  shortTerm: string[]; // 1-3 months
  longTerm: string[]; // 3-12 months
  preventiveMeasures: string[];
}

export interface StrategicDebtAnalysis {
  // Debt Classification
  debtType: 'PERSONAL_CONSUMER' | 'BUSINESS_COMMERCIAL' | 'MIXED';
  totalDebt: number;
  securedDebt: number;
  unsecuredDebt: number;
  
  // Legal Protection
  fdcpaProtection: boolean; // Consumer debt only
  statuteExpired: boolean;
  yearsUntilStatuteExpires: number;
  
  // Asset Protection
  personalAssetsAtRisk: boolean;
  businessAssetsAtRisk: boolean;
  protectedAssets: string[];
  vulnerableAssets: string[];
  
  // Strategic Positioning
  debtorAdvantages: string[];
  creditorWeaknesses: string[];
  negotiationLeverage: number; // 0-100%
  
  // Insurance-Enhanced Strategy
  insuranceBackedStrategy: {
    canAffordAttorney: boolean;
    canCountersue: boolean;
    canLitigate: boolean;
    aggressiveness: 'DEFENSIVE' | 'BALANCED' | 'AGGRESSIVE';
  };
  
  // UCC-Enhanced Strategy
  uccProtectedAssets: {
    romanAI: boolean; // R.O.M.A.N. 2.0 AI secured via UCC-1
    patent: boolean; // Patent #63/913,134 secured
    businessIP: boolean;
    equipment: boolean;
    trademarks: boolean;
  };
  
  // Trust-Enhanced Strategy
  trustStrategy: {
    assetsInTrust: string[];
    trustType: string;
    creditorReach: 'NONE' | 'LIMITED' | 'FULL';
    spendthriftProvision: boolean; // Blocks creditors
  };
}

export class RomanAdvancedStrategyEngine {
  
  /**
   * Analyzes complete asset protection posture across all layers
   */
  async analyzeAssetProtection(userId: string, debtAccountId?: string): Promise<AssetProtectionStrategy> {
    // Load all protection layers - REAL DATA ONLY
    const [entities, insurance, evidence, debts] = await Promise.all([
      this.loadBusinessEntities(userId),
      this.loadInsurancePolicies(userId),
      this.loadEvidence(userId),
      debtAccountId ? this.loadDebtAccount(debtAccountId) : null
    ]);

    // Analyze corporate shield
    const corporateShield = this.analyzeCorporateShield(entities, debts);
    
    // Analyze trust protection
    const trustProtection = this.analyzeTrustProtection(entities);
    
    // Analyze UCC secured assets
    const uccSecuredAssets = this.analyzeUCCSecuredAssets(entities);
    
    // Analyze insurance coverage
    const insuranceCoverage = this.analyzeInsuranceCoverage(insurance);
    
    // Analyze bankruptcy options
    const bankruptcyAnalysis = this.analyzeBankruptcyOptions(debts, entities);
    
    // Calculate overall defense strength
    const defenseStrength = this.calculateDefenseStrength({
      corporateShield,
      trustProtection,
      uccSecuredAssets,
      insuranceCoverage,
      bankruptcyAnalysis
    });
    
    // Generate strategic recommendations
    const recommendations = this.generateRecommendations({
      corporateShield,
      trustProtection,
      uccSecuredAssets,
      insuranceCoverage,
      bankruptcyAnalysis,
      defenseStrength
    });

    return {
      overallApproach: this.determineOverallApproach(defenseStrength, insuranceCoverage),
      defenseStrength,
      estimatedCost: this.estimateImplementationCost(recommendations),
      timeToImplement: this.estimateTimeframe(recommendations),
      corporateShield,
      trustProtection,
      uccSecuredAssets,
      insuranceCoverage,
      bankruptcyAnalysis,
      ...recommendations
    };
  }

  /**
   * Analyzes corporate veil protection
   */
  private analyzeCorporateShield(entities: any[], debts: any): AssetProtectionStrategy['corporateShield'] {
    const llcs = entities.filter(e => e.entity_type === 'llc');
    const corporations = entities.filter(e => e.entity_type === 'corporation');
    
    const hasLLC = llcs.length > 0;
    const hasMultipleLLCs = llcs.length > 1;
    
    // Check corporate formalities (treat undefined as unknown/assumed compliant)
    const formalitiesMaintained = entities.every(e => {
      if (e.entity_type !== 'llc' && e.entity_type !== 'corporation') return true;
      const hasOperatingAgreement = e.operating_agreement_on_file !== false;
      const hasFormalities = e.corporate_formalities_maintained !== false;
      return hasOperatingAgreement && hasFormalities;
    });
    
    // Check for personal guarantees
    const personalGuarantees = debts?.personal_guarantee 
      ? [`Personal guarantee on ${debts.creditor} debt`]
      : [];
    
    // Calculate veil piercing risk
    let veilPiercingRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (!formalitiesMaintained) veilPiercingRisk = 'HIGH';
    else if (personalGuarantees.length > 0) veilPiercingRisk = 'MEDIUM';
    
    const recommendations: string[] = [];
    if (!hasLLC) {
      recommendations.push('🏛️ Form LLC immediately to shield personal assets');
    }
    if (!formalitiesMaintained) {
      recommendations.push('⚠️ CRITICAL: File operating agreement & maintain corporate minutes');
      recommendations.push('⚠️ CRITICAL: Separate business/personal finances (no commingling)');
    }
    if (personalGuarantees.length > 0) {
      recommendations.push('🚨 DANGER: Personal guarantees bypass LLC protection');
      recommendations.push('💡 Strategy: Consider bankruptcy to discharge personal guarantee');
    }
    if (hasLLC && formalitiesMaintained) {
      recommendations.push('✅ Corporate shield intact - personal assets protected');
    }

    return {
      hasLLC,
      hasMultipleLLCs,
      corporateFormalities: formalitiesMaintained,
      personalGuarantees,
      veilPiercingRisk,
      recommendations
    };
  }

  /**
   * Analyzes trust-based asset protection
   */
  private analyzeTrustProtection(entities: any[]): AssetProtectionStrategy['trustProtection'] {
    const trusts = entities.filter(e => e.entity_type === 'trust');
    const hasTrusts = trusts.length > 0;
    
    const trustTypes = trusts.map(t => t.trust_type || 'unknown');
    const trustNames = trusts.map(t => t.trust_name || t.name || 'Trust');
    const trustIds = trusts.flatMap(t => [
      t.trust_id,
      t.certificate_number,
      t.bloodline_trust_id
    ].filter(Boolean));
    const assetsInTrust = trusts.flatMap(t => t.holds_assets || []);
    
    // Irrevocable trusts provide better creditor protection
    const revocableVsIrrevocable = trusts.some(t => t.trust_type === 'irrevocable')
      ? 'Has irrevocable trust (strong protection)'
      : 'Only revocable trusts (weak protection)';
    
    const creditorProtection = trusts.some(t => 
      t.trust_type === 'irrevocable' || t.trust_type === 'asset_protection'
    );
    
    const recommendations: string[] = [];
    if (!hasTrusts) {
      recommendations.push('🏛️ Consider irrevocable trust for high-value assets (R.O.M.A.N. IP, patent)');
      recommendations.push('💡 Spendthrift provision blocks creditor access');
    }
    if (trusts.some(t => t.trust_type === 'revocable')) {
      recommendations.push('⚠️ Revocable trusts do NOT protect from creditors (you still control assets)');
      recommendations.push('💡 Convert to irrevocable trust for real protection');
    }
    if (creditorProtection) {
      recommendations.push('✅ Asset protection trust shields high-value IP from creditors');
    }

    return {
      hasTrusts,
      trustTypes,
      trustNames,
      trustIds,
      assetsInTrust,
      revocableVsIrrevocable,
      creditorProtection,
      recommendations
    };
  }

  /**
   * Analyzes UCC-1 secured assets (LEGITIMATE use - securing YOUR intellectual property)
   */
  private analyzeUCCSecuredAssets(entities: any[]): AssetProtectionStrategy['uccSecuredAssets'] {
    const uccFilings = entities.filter(e => e.entity_type === 'ucc_filing');
    const hasUCCFilings = uccFilings.length > 0;
    
    const securedAssets = uccFilings.flatMap(f => f.collateral_description || []);
    const uccFilingNumbers = uccFilings.map(f => f.ucc_filing_number).filter(Boolean);
    
    // UCC-1 protects YOUR assets from unsecured creditors (LEGITIMATE STRATEGY)
    const protectionLevel: 'FULL' | 'PARTIAL' | 'NONE' = hasUCCFilings ? 'FULL' : 'NONE';
    
    const recommendations: string[] = [];
    if (!hasUCCFilings) {
      recommendations.push('🏛️ File UCC-1 to secure R.O.M.A.N. AI intellectual property');
      recommendations.push('🏛️ File UCC-1 to secure Patent #63/913,134');
      recommendations.push('💡 UCC secured assets NOT available to unsecured creditors');
      recommendations.push('💡 Establishes priority: secured creditors paid first in bankruptcy');
    }
    if (hasUCCFilings) {
      recommendations.push('✅ IP assets secured via UCC-1 - protected from unsecured creditor claims');
      recommendations.push('✅ Establishes institutional positioning (not individual debtor)');
    }

    return {
      hasUCCFilings,
      securedAssets,
      uccFilingNumbers,
      protectionLevel,
      recommendations
    };
  }

  /**
   * Analyzes insurance coverage for legal defense
   */
  private analyzeInsuranceCoverage(policies: any[]): AssetProtectionStrategy['insuranceCoverage'] {
    const legalDefenseCoverage = policies.some(p => 
      p.coverage_type?.includes('legal_defense') || 
      p.coverage_type?.includes('attorney_fees')
    );
    
    const dAndOInsurance = policies.some(p => p.policy_type === 'directors_officers');
    const umbrellaPolicy = policies.some(p => p.policy_type === 'umbrella');
    const commercialLiability = policies.some(p => p.policy_type === 'commercial_liability');
    
    const coverageLimit = policies.reduce((sum, p) => sum + (p.coverage_limit || 0), 0);
    
    // With insurance, can afford to be MORE aggressive (have attorney backing)
    const canAffordLitigation = legalDefenseCoverage || dAndOInsurance || coverageLimit > 100000;
    
    const recommendations: string[] = [];
    if (!legalDefenseCoverage) {
      recommendations.push('⚠️ No legal defense coverage - litigation expensive');
      recommendations.push('💡 Add legal defense rider to business policy');
    }
    if (!dAndOInsurance) {
      recommendations.push('💡 D&O insurance shields personal liability for business decisions');
    }
    if (canAffordLitigation) {
      recommendations.push('✅ STRATEGY SHIFT: With insurance, can counterclaim for FDCPA violations');
      recommendations.push('✅ Aggressive tone in letters: "We are prepared to litigate"');
      recommendations.push('✅ File lawsuits for unauthorized credit inquiries ($100-$1000 each)');
    }
    if (!canAffordLitigation) {
      recommendations.push('💡 Without insurance: Focus on settlement, not litigation');
    }

    return {
      legalDefenseCoverage,
      dAndOInsurance,
      umbrellaPolicy,
      commercialLiability,
      estimatedCoverageLimit: coverageLimit,
      canAffordLitigation,
      recommendations
    };
  }

  /**
   * Analyzes bankruptcy options
   */
  private analyzeBankruptcyOptions(debts: any, entities: any[]): AssetProtectionStrategy['bankruptcyAnalysis'] {
    const totalDebt = debts?.current_amount || 0;
    
    // Georgia bankruptcy exemptions
    const exemptAssets = [
      'Homestead exemption ($21,500)',
      'Motor vehicle ($5,000)',
      'Tools of trade ($1,500)',
      'Household goods & clothing',
      'Retirement accounts (unlimited)',
      'Life insurance cash value',
      '75% of disposable earnings'
    ];
    
    const nonExemptAssets = [
      'Cash over exemption limits',
      'Investment accounts',
      'Second homes/rental property',
      'Business assets (unless sole proprietorship tools)'
    ];
    
    // Chapter 7: Liquidation (discharge debt, keep exempt assets)
    // Chapter 13: Repayment plan (keep all assets, pay over 3-5 years)
    const chapter7Eligible = totalDebt < 500000; // Rough eligibility
    const chapter13Eligible = true; // Most people eligible
    
    const preferredChapter = debts?.personal_guarantee ? 7 : null;
    
    const recommendations: string[] = [];
    if (debts?.personal_guarantee) {
      recommendations.push('💡 Chapter 7 bankruptcy discharges personal guarantee (LLC shield failed)');
      recommendations.push('💡 Timing: File BEFORE judgment to avoid wage garnishment');
    }
    if (totalDebt > 0 && totalDebt < 50000) {
      recommendations.push('💡 Small debt: Settlement cheaper than bankruptcy');
    }
    if (totalDebt > 100000) {
      recommendations.push('💡 Large debt: Bankruptcy may be strategic reset');
      recommendations.push('💡 Chapter 13: Keep assets, pay over 3-5 years');
    }

    return {
      dischargeable: true, // Most business debt is dischargeable
      exemptAssets,
      nonExemptAssets,
      chapter7Eligible,
      chapter13Eligible,
      preferredChapter,
      recommendations
    };
  }

  /**
   * Calculate overall defense strength
   */
  private calculateDefenseStrength(layers: any): number {
    let strength = 0;
    
    // Corporate shield (0-25 points)
    if (layers.corporateShield.hasLLC) strength += 15;
    if (layers.corporateShield.corporateFormalities) strength += 10;
    
    // Trust protection (0-20 points)
    if (layers.trustProtection.creditorProtection) strength += 20;
    
    // UCC secured assets (0-25 points)
    if (layers.uccSecuredAssets.protectionLevel === 'FULL') strength += 25;
    
    // Insurance (0-30 points)
    if (layers.insuranceCoverage.canAffordLitigation) strength += 30;
    
    return Math.min(100, strength);
  }

  /**
   * Generate strategic recommendations
   */
  private generateRecommendations(analysis: any): Pick<AssetProtectionStrategy, 'immediateActions' | 'shortTerm' | 'longTerm' | 'preventiveMeasures'> {
    const immediateActions: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    const preventiveMeasures: string[] = [];

    // Immediate (today)
    if (!analysis.corporateShield.hasLLC) {
      immediateActions.push('Form LLC to shield personal assets');
    }
    if (analysis.corporateShield.veilPiercingRisk === 'HIGH') {
      immediateActions.push('CRITICAL: Stop commingling funds, file operating agreement');
    }
    
    // Short term (1-3 months)
    if (!analysis.uccSecuredAssets.hasUCCFilings) {
      shortTerm.push('File UCC-1 to secure R.O.M.A.N. AI & Patent #63/913,134');
    }
    if (!analysis.insuranceCoverage.legalDefenseCoverage) {
      shortTerm.push('Add legal defense coverage to business policy');
    }
    
    // Long term (3-12 months)
    if (!analysis.trustProtection.creditorProtection) {
      longTerm.push('Establish irrevocable trust for high-value IP assets');
    }
    
    // Preventive measures
    preventiveMeasures.push('Maintain corporate formalities (annual meetings, minutes)');
    preventiveMeasures.push('Never sign personal guarantees on business debt');
    preventiveMeasures.push('Keep business/personal finances completely separate');
    preventiveMeasures.push('File UCC-1 for all valuable IP/equipment');
    preventiveMeasures.push('Maintain adequate insurance coverage');

    return {
      immediateActions,
      shortTerm,
      longTerm,
      preventiveMeasures
    };
  }

  /**
   * Determine overall strategic approach
   */
  private determineOverallApproach(strength: number, insurance: any): string {
    if (strength > 75 && insurance.canAffordLitigation) {
      return 'AGGRESSIVE: Strong protections + insurance backing. Demand validation, counterclaim violations, litigate if necessary.';
    }
    if (strength > 50) {
      return 'BALANCED: Solid protections. Demand validation, negotiate from strength, settle strategically.';
    }
    if (strength < 30 && insurance.canAffordLitigation) {
      return 'REBUILD: Weak protections BUT have insurance. Focus on building shields while defending aggressively.';
    }
    return 'DEFENSIVE: Limited protections. Focus on statute of limitations, settle when strategic, avoid litigation.';
  }

  private estimateImplementationCost(recommendations: any): number {
    let cost = 0;
    
    if (recommendations.immediateActions.some((a: string) => a.includes('LLC'))) cost += 500;
    if (recommendations.shortTerm.some((a: string) => a.includes('UCC'))) cost += 200;
    if (recommendations.longTerm.some((a: string) => a.includes('trust'))) cost += 2500;
    if (recommendations.shortTerm.some((a: string) => a.includes('insurance'))) cost += 1200;
    
    return cost;
  }

  private estimateTimeframe(recommendations: any): string {
    if (recommendations.immediateActions.length > 0) return '1-2 weeks (urgent)';
    if (recommendations.shortTerm.length > 0) return '1-3 months';
    return '3-12 months (strategic build)';
  }

  // Database helpers
  private async loadBusinessEntities(userId: string) {
    // Load from system_logs where UCC filings are recorded
    const { data: sysLogs } = await supabase
      .from('system_logs')
      .select('*')
      .eq('source', 'legal_filing')
      .order('created_at', { ascending: false });

    if (!sysLogs) return [];

    // Transform system logs into entity format
    const entities: any[] = [];

    // Extract UCC filings from system logs
    const uccFilings = sysLogs.filter((log: any) => 
      log.message?.includes('UCC-1') && log.metadata?.recordId
    );

    for (const filing of uccFilings) {
      entities.push({
        entity_type: 'ucc_filing',
        ucc_filing_number: filing.metadata.recordId,
        filing_date: filing.metadata.filingDate,
        status: filing.metadata.status,
        secured_party: filing.metadata.securedParty,
        debtors: filing.metadata.debtors,
        collateral_description: filing.metadata.collateral,
        lien_amount: filing.metadata.lienAmount,
        metadata: filing.metadata
      });
    }

    // Also check legal_defense_accounts for UCC filings
    const { data: defenseAccounts } = await supabase
      .from('legal_defense_accounts')
      .select('*')
      .ilike('account_type', '%UCC%');

    if (defenseAccounts) {
      for (const account of defenseAccounts) {
        if (!entities.find(e => e.ucc_filing_number === account.filing_record)) {
          entities.push({
            entity_type: 'ucc_filing',
            ucc_filing_number: account.filing_record,
            lien_amount: account.current_amount,
            status: account.status
          });
        }
      }
    }

    // If we have trust documents in system logs, extract those too
    const trustLogs = sysLogs.filter((log: any) =>
      log.message?.includes('Trust') || log.message?.includes('HJFAT')
    );

    for (const trustLog of trustLogs) {
      if (trustLog.metadata?.trust_id) {
        entities.push({
          entity_type: 'trust',
          trust_name: trustLog.metadata.trust_name || 'Howard Jones Family Ancestral Trust',
          trust_type: trustLog.metadata.trust_type || 'irrevocable',
          trust_id: trustLog.metadata.trust_id,
          certificate_number: trustLog.metadata.certificate_number,
          bloodline_trust_id: trustLog.metadata.bloodline_trust_id,
          valuation_conservative: 1116000000,
          valuation_market: 2450000000,
          valuation_optimistic: 7460000000,
          holds_assets: trustLog.metadata.holds_assets || []
        });
      }
    }

    return entities;
  }

  private async loadInsurancePolicies(userId: string) {
    const { data } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }

  private async loadEvidence(userId: string) {
    const { data } = await supabase
      .from('evidence_log')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }

  private async loadDebtAccount(id: string) {
    const { data } = await supabase
      .from('business_debt_accounts')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }
}

export const romanAdvancedStrategy = new RomanAdvancedStrategyEngine();
