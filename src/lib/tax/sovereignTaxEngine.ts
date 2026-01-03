/**
 * 🏛️ ODYSSEY-1 | SOVEREIGN TAX ENGINE (v1.2)
 * Authorized by Architect Directive: DIR-20260102-BRAVO
 * * Hierarchy of Truth:
 * 1. Product-Specific Rate (from database - Decimal 0.0875)
 * 2. Sovereign Fallback (8.75% Georgia Rate)
 * * Mismatch Resolution (DIR-20260102-BRAVO-02):
 * This version includes normalization logic to handle the discrepancy 
 * between frontend percentages (8.75) and backend decimals (0.0875).
 */

export const GEORGIA_TAX_RATE = 0.0875; // 8.75% default decimal

export interface FinancialBreakdown {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  taxRate: number; // Always stored/returned as decimal (0.0875)
  formattedSubtotal: string;
  formattedTax: string;
  formattedTotal: string;
  isSovereignFallback: boolean;
}

export interface LineItem {
  id?: string;
  name: string;
  amount: number; // in cents
  is_taxable: boolean;
  tax_rate?: number | null;
}

/**
 * Normalizes a tax rate input.
 * If the rate is > 1 (e.g., 8.75), it treats it as a percentage and converts to decimal.
 * If the rate is <= 1 (e.g., 0.0875), it treats it as a decimal.
 */
export const normalizeTaxRate = (rate: number): number => {
  if (rate > 1) {
    return rate / 100;
  }
  return rate;
};

/**
 * Resolves the effective tax rate. 
 * Prioritizes the database-driven rate, falls back to the Sovereign constant.
 */
export const resolveTaxRate = (productRate?: number | null): number => {
  if (productRate === undefined || productRate === null) {
    return GEORGIA_TAX_RATE;
  }
  return normalizeTaxRate(productRate);
};

/**
 * Calculates a complete financial breakdown for a given amount in cents.
 * Uses integer math (cents) to avoid floating point errors in currency.
 */
export const calculateHJSTax = (amountInCents: number, productRate?: number | null): FinancialBreakdown => {
  const activeRate = resolveTaxRate(productRate);
  const isSovereignFallback = activeRate === GEORGIA_TAX_RATE && productRate == null;
  
  // Calculate tax in cents, rounding to nearest integer
  const taxCents = Math.round(amountInCents * activeRate);
  const totalCents = amountInCents + taxCents;

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  return {
    subtotalCents: amountInCents,
    taxCents,
    totalCents,
    taxRate: activeRate,
    formattedSubtotal: formatCurrency(amountInCents),
    formattedTax: formatCurrency(taxCents),
    formattedTotal: formatCurrency(totalCents),
    isSovereignFallback,
  };
};

/**
 * Batch calculation for multiple line items (used in AutomatedInvoicing.tsx)
 */
export const calculateLineItemsTax = (items: LineItem[]) => {
  return items.reduce((acc, item) => {
    const subtotal = item.amount;
    const breakdown = item.is_taxable 
      ? calculateHJSTax(subtotal, item.tax_rate)
      : { taxCents: 0, totalCents: subtotal };
    
    return {
      subtotalCents: acc.subtotalCents + subtotal,
      taxCents: acc.taxCents + breakdown.taxCents,
      totalCents: acc.totalCents + breakdown.totalCents,
    };
  }, { subtotalCents: 0, taxCents: 0, totalCents: 0 });
};

/**
 * Validation Test Case: TP-2PLY-96J (Toilet Paper)
 * Input: $45.00 (4500 cents)
 * Expected Tax: $3.94 (393.75 rounded to 394)
 * Expected Total: $48.94
 */
export const verifyCommercialIntegrity = (): boolean => {
  const testAmount = 4500; // $45.00
  
  // Test 1: Decimal Input (Database Style)
  const resultDecimal = calculateHJSTax(testAmount, 0.0875);
  // Test 2: Percentage Input (Legacy Frontend Style)
  const resultPercent = calculateHJSTax(testAmount, 8.75);
  
  const isValid = 
    resultDecimal.taxCents === 394 && 
    resultPercent.taxCents === 394 &&
    resultDecimal.totalCents === 4894;
  
  if (!isValid) {
    console.error('⚠️ COMMERCIAL INCOHERENCE DETECTED: Tax engine failed validation test.');
  } else {
    console.log('✅ HJS Commercial Integrity Verified: Normalization logic (8.75 vs 0.0875) holding steady.');
  }
  
  return isValid;
};