/**
 * Tax Calculation Service
 * Handles federal, state, FICA, and Medicare tax calculations
 * © 2025 Rickey A Howard. All Rights Reserved.
 */

import { supabase } from '@/lib/supabase';

export interface TaxBracket {
  bracket_min: number;
  bracket_max: number | null;
  tax_rate: number;
  base_tax: number;
}

export interface PayrollTaxRates {
  social_security_rate: number;
  social_security_wage_base: number;
  medicare_rate: number;
  medicare_additional_rate: number;
  medicare_additional_threshold: number;
}

export interface W4Info {
  filing_status: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  number_of_dependents: number;
  dependent_credit_amount: number;
  other_income: number;
  deductions: number;
  extra_withholding: number;
  is_exempt: boolean;
}

export interface TaxCalculationResult {
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  social_security: number;
  medicare: number;
  additional_medicare: number;
  total_taxes: number;
  net_pay: number;
  effective_tax_rate: number;
}

export class TaxCalculationService {
  /**
   * Calculate all taxes for a paycheck
   */
  static async calculatePayrollTaxes(
    grossPay: number,
    payPeriod: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly',
    employeeId: string,
    stateCode: string = 'GA',
    taxYear: number = new Date().getFullYear()
  ): Promise<TaxCalculationResult> {
    // Annualize gross pay for bracket calculations
    const annualizedPay = this.annualizePay(grossPay, payPeriod);

    // Get W-4 information
    const w4Info = await this.getEmployeeW4(employeeId);

    // Calculate federal tax
    const federalTax = w4Info.is_exempt 
      ? 0 
      : await this.calculateFederalTax(annualizedPay, w4Info, payPeriod, taxYear);

    // Calculate state tax
    const stateTax = await this.calculateStateTax(annualizedPay, w4Info.filing_status, stateCode, payPeriod, taxYear);

    // Calculate FICA and Medicare
    const { socialSecurity, medicare, additionalMedicare } = await this.calculateFICATaxes(grossPay, taxYear);

    const totalTaxes = federalTax + stateTax + socialSecurity + medicare + additionalMedicare;
    const netPay = grossPay - totalTaxes;
    const effectiveTaxRate = (totalTaxes / grossPay) * 100;

    return {
      gross_pay: grossPay,
      federal_tax: federalTax,
      state_tax: stateTax,
      social_security: socialSecurity,
      medicare: medicare,
      additional_medicare: additionalMedicare,
      total_taxes: totalTaxes,
      net_pay: netPay,
      effective_tax_rate: effectiveTaxRate
    };
  }

  /**
   * Get employee W-4 information
   */
  private static async getEmployeeW4(employeeId: string): Promise<W4Info> {
    const { data, error } = await supabase
      .from('employee_w4_forms')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Return default W-4 if not found
      return {
        filing_status: 'single',
        number_of_dependents: 0,
        dependent_credit_amount: 0,
        other_income: 0,
        deductions: 0,
        extra_withholding: 0,
        is_exempt: false
      };
    }

    return {
      filing_status: data.filing_status as any,
      number_of_dependents: data.number_of_dependents || 0,
      dependent_credit_amount: data.dependent_credit_amount || 0,
      other_income: data.other_income || 0,
      deductions: data.deductions || 0,
      extra_withholding: data.extra_withholding || 0,
      is_exempt: data.is_exempt || false
    };
  }

  /**
   * Calculate federal income tax using IRS tax brackets
   */
  private static async calculateFederalTax(
    annualizedPay: number,
    w4Info: W4Info,
    payPeriod: string,
    taxYear: number
  ): Promise<number> {
    // Adjust income based on W-4
    const adjustedIncome = annualizedPay + w4Info.other_income - w4Info.deductions;

    // Get standard deduction for filing status
    const standardDeduction = this.getStandardDeduction(w4Info.filing_status, taxYear);
    const taxableIncome = Math.max(0, adjustedIncome - standardDeduction);

    // Get tax brackets
    const { data: brackets } = await supabase
      .from('federal_tax_brackets')
      .select('*')
      .eq('tax_year', taxYear)
      .eq('filing_status', w4Info.filing_status)
      .order('bracket_min', { ascending: true });

    if (!brackets || brackets.length === 0) {
      console.error('No federal tax brackets found');
      return 0;
    }

    // Calculate tax using brackets
    let annualTax = this.calculateTaxFromBrackets(taxableIncome, brackets as TaxBracket[]);

    // Subtract dependent credits
    if (w4Info.number_of_dependents > 0) {
      const dependentCredit = w4Info.dependent_credit_amount || (w4Info.number_of_dependents * 2000);
      annualTax = Math.max(0, annualTax - dependentCredit);
    }

    // Convert to pay period amount
    const periodsPerYear = this.getPeriodsPerYear(payPeriod);
    let periodTax = annualTax / periodsPerYear;

    // Add extra withholding
    periodTax += w4Info.extra_withholding;

    return Math.round(periodTax * 100) / 100;
  }

  /**
   * Calculate state income tax
   */
  private static async calculateStateTax(
    annualizedPay: number,
    filingStatus: string,
    stateCode: string,
    payPeriod: string,
    taxYear: number
  ): Promise<number> {
    // Get state tax brackets
    const { data: brackets } = await supabase
      .from('state_tax_brackets')
      .select('*')
      .eq('tax_year', taxYear)
      .eq('state_code', stateCode)
      .eq('filing_status', filingStatus)
      .order('bracket_min', { ascending: true });

    if (!brackets || brackets.length === 0) {
      return 0; // State has no income tax or brackets not configured
    }

    // Calculate annual state tax
    const annualTax = this.calculateTaxFromBrackets(annualizedPay, brackets as TaxBracket[]);

    // Convert to pay period amount
    const periodsPerYear = this.getPeriodsPerYear(payPeriod);
    return Math.round((annualTax / periodsPerYear) * 100) / 100;
  }

  /**
   * Calculate FICA (Social Security and Medicare) taxes
   */
  private static async calculateFICATaxes(
    grossPay: number,
    taxYear: number
  ): Promise<{ socialSecurity: number; medicare: number; additionalMedicare: number }> {
    const { data: rates } = await supabase
      .from('payroll_tax_rates')
      .select('*')
      .eq('tax_year', taxYear)
      .single();

    if (!rates) {
      // Use default rates if not found
      return {
        socialSecurity: Math.round(grossPay * 0.062 * 100) / 100,
        medicare: Math.round(grossPay * 0.0145 * 100) / 100,
        additionalMedicare: 0
      };
    }

    // Social Security (capped at wage base)
    const socialSecurity = Math.round(Math.min(grossPay, rates.social_security_wage_base) * rates.social_security_rate * 100) / 100;

    // Medicare (no cap)
    const medicare = Math.round(grossPay * rates.medicare_rate * 100) / 100;

    // Additional Medicare tax (for high earners)
    const additionalMedicare = grossPay > rates.medicare_additional_threshold
      ? Math.round((grossPay - rates.medicare_additional_threshold) * rates.medicare_additional_rate * 100) / 100
      : 0;

    return { socialSecurity, medicare, additionalMedicare };
  }

  /**
   * Calculate tax from progressive brackets
   */
  private static calculateTaxFromBrackets(income: number, brackets: TaxBracket[]): number {
    let totalTax = 0;

    for (const bracket of brackets) {
      if (income <= bracket.bracket_min) {
        break;
      }

      const taxableInThisBracket = bracket.bracket_max
        ? Math.min(income, bracket.bracket_max) - bracket.bracket_min
        : income - bracket.bracket_min;

      if (taxableInThisBracket > 0) {
        totalTax = bracket.base_tax + (taxableInThisBracket * bracket.tax_rate);
      }
    }

    return totalTax;
  }

  /**
   * Annualize pay based on pay period
   */
  private static annualizePay(grossPay: number, payPeriod: string): number {
    return grossPay * this.getPeriodsPerYear(payPeriod);
  }

  /**
   * Get number of pay periods per year
   */
  private static getPeriodsPerYear(payPeriod: string): number {
    switch (payPeriod) {
      case 'weekly': return 52;
      case 'biweekly': return 26;
      case 'semimonthly': return 24;
      case 'monthly': return 12;
      default: return 26;
    }
  }

  /**
   * Get standard deduction for filing status
   */
  private static getStandardDeduction(filingStatus: string, taxYear: number): number {
    // 2024 standard deductions
    if (taxYear === 2024) {
      switch (filingStatus) {
        case 'single': return 14600;
        case 'married_joint': return 29200;
        case 'married_separate': return 14600;
        case 'head_of_household': return 21900;
        default: return 14600;
      }
    }
    // 2025 standard deductions
    if (taxYear === 2025) {
      switch (filingStatus) {
        case 'single': return 15000;
        case 'married_joint': return 30000;
        case 'married_separate': return 15000;
        case 'head_of_household': return 22500;
        default: return 15000;
      }
    }
    return 14600; // Default
  }

  /**
   * Calculate year-to-date totals for an employee
   */
  static async calculateYTD(employeeId: string, organizationId: number, taxYear: number): Promise<{
    ytd_gross: number;
    ytd_federal_tax: number;
    ytd_state_tax: number;
    ytd_social_security: number;
    ytd_medicare: number;
    ytd_net: number;
  }> {
    const { data: paystubs } = await supabase
      .from('paystubs')
      .select('*')
      .eq('employee', employeeId)
      .eq('organization_id', organizationId)
      .gte('payperiodstart', `${taxYear}-01-01`)
      .lte('payperiodend', `${taxYear}-12-31`)
      .eq('status', 'processed');

    if (!paystubs || paystubs.length === 0) {
      return {
        ytd_gross: 0,
        ytd_federal_tax: 0,
        ytd_state_tax: 0,
        ytd_social_security: 0,
        ytd_medicare: 0,
        ytd_net: 0
      };
    }

    const ytd = paystubs.reduce((acc, stub) => ({
      ytd_gross: acc.ytd_gross + (stub.grosspay || 0),
      ytd_federal_tax: acc.ytd_federal_tax + (stub.federal_tax || 0),
      ytd_state_tax: acc.ytd_state_tax + (stub.state_tax || 0),
      ytd_social_security: acc.ytd_social_security + (stub.fica_ss || 0),
      ytd_medicare: acc.ytd_medicare + (stub.fica_medicare || 0),
      ytd_net: acc.ytd_net + (stub.netpay || 0)
    }), {
      ytd_gross: 0,
      ytd_federal_tax: 0,
      ytd_state_tax: 0,
      ytd_social_security: 0,
      ytd_medicare: 0,
      ytd_net: 0
    });

    return ytd;
  }

  /**
   * Generate 1099-NEC for contractor
   */
  static async generate1099NEC(
    contractorId: string,
    organizationId: number,
    taxYear: number
  ): Promise<{ total_payments: number; form_id: string } | null> {
    // Get all payments to contractor for the year
    const { data: paystubs } = await supabase
      .from('paystubs')
      .select('*')
      .eq('employee', contractorId)
      .eq('organization_id', organizationId)
      .gte('payperiodstart', `${taxYear}-01-01`)
      .lte('payperiodend', `${taxYear}-12-31`)
      .eq('status', 'processed');

    if (!paystubs || paystubs.length === 0) {
      return null;
    }

    const totalPayments = paystubs.reduce((sum, stub) => sum + (stub.grosspay || 0), 0);

    // Only required if payments >= $600
    if (totalPayments < 600) {
      console.log(`Contractor ${contractorId} payments under $600 threshold: $${totalPayments}`);
      return null;
    }

    // Create or update 1099-NEC record
    const { data: existing } = await supabase
      .from('form_1099_nec')
      .select('id')
      .eq('contractor_id', contractorId)
      .eq('tax_year', taxYear)
      .single();

    if (existing) {
      // Update existing
      await supabase
        .from('form_1099_nec')
        .update({
          nonemployee_compensation: totalPayments,
          status: 'ready_to_file',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      return { total_payments: totalPayments, form_id: existing.id };
    } else {
      // Create new
      const { data: newForm } = await supabase
        .from('form_1099_nec')
        .insert({
          organization_id: organizationId,
          contractor_id: contractorId,
          tax_year: taxYear,
          nonemployee_compensation: totalPayments,
          status: 'ready_to_file'
        })
        .select('id')
        .single();

      return { total_payments: totalPayments, form_id: newForm?.id || '' };
    }
  }
}
