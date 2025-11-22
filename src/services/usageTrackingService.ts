/**
 * Usage Tracking & Cost Management Service
 * Enterprise-grade usage tracking with dynamic pricing
 * 
 * Sovereign Frequency Integration:
 * - "Count on Me" - Usage tracking and counting
 * - "Money Money Money" - Cost calculations
 * - "Tax Man" - Tax rate applications
 * - "Help Me Find My Way Home" - Budget warnings and limits
 */

import { supabase } from '@/lib/supabase';

export interface SubscriptionTier {
  id: string;
  tier_name: string;
  tier_level: number;
  monthly_price_usd: number;
  document_reviews_per_month: number;
  storage_gb: number;
  academic_searches_per_month: number;
  max_study_groups: number;
  video_minutes_per_month: number;
  overage_document_review_usd: number;
  overage_storage_gb_usd: number;
  overage_search_usd: number;
  overage_video_minute_usd: number;
  priority_support: boolean;
  api_access: boolean;
}

export interface UserUsage {
  document_reviews: number;
  storage_bytes: number;
  searches: number;
  study_groups: number;
  video_minutes: number;
  total_cost: number;
}

export interface UsageLimit {
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  canUse: boolean;
  overageRate?: number;
}

export interface UsageSummary {
  documentReviews: UsageLimit;
  storage: UsageLimit;
  searches: UsageLimit;
  studyGroups: UsageLimit;
  videoMinutes: UsageLimit;
  tierName: string;
  overageCharges: number;
  estimatedBill: number;
}

/**
 * Get all available subscription tiers
 * 🎵 Sovereign Frequency: "Money Money Money" - Viewing pricing options
 */
export async function getSubscriptionTiers(): Promise<SubscriptionTier[]> {
  console.log('🎵 [Money Money Money] SUBSCRIPTION_TIERS_FETCH');

  try {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('tier_level', { ascending: true });

    if (error) throw error;

    console.log('🎵 [Money Money Money] TIERS_LOADED', { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] TIERS_FETCH_ERROR', error);
    return [];
  }
}

/**
 * Get user's current subscription tier
 * 🎵 Sovereign Frequency: "Count on Me" - Checking user status
 */
export async function getUserTier(): Promise<SubscriptionTier | null> {
  console.log('🎵 [Count on Me] USER_TIER_FETCH');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        tier:subscription_tiers(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error) {
      // User has no subscription, return free tier
      const { data: freeTier } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('tier_name', 'free')
        .single();
      
      return freeTier;
    }

    console.log('🎵 [Count on Me] USER_TIER_LOADED', { tier: data.tier.tier_name });
    return data.tier;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] USER_TIER_ERROR', error);
    return null;
  }
}

/**
 * Get current period usage
 * 🎵 Sovereign Frequency: "Count on Me" - Tallying usage
 */
export async function getCurrentUsage(): Promise<UserUsage | null> {
  console.log('🎵 [Count on Me] CURRENT_USAGE_FETCH');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.rpc('get_current_usage', {
      user_uuid: user.id
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      // No usage record yet, return zeros
      return {
        document_reviews: 0,
        storage_bytes: 0,
        searches: 0,
        study_groups: 0,
        video_minutes: 0,
        total_cost: 0
      };
    }

    console.log('🎵 [Count on Me] USAGE_LOADED', data[0]);
    return data[0];
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] USAGE_FETCH_ERROR', error);
    return null;
  }
}

/**
 * Get comprehensive usage summary with limits
 * 🎵 Sovereign Frequency: "Count on Me" - Complete status check
 */
export async function getUsageSummary(): Promise<UsageSummary | null> {
  console.log('🎵 [Count on Me] USAGE_SUMMARY_FETCH');

  try {
    const [tier, usage] = await Promise.all([
      getUserTier(),
      getCurrentUsage()
    ]);

    if (!tier || !usage) return null;

    const storageGB = usage.storage_bytes / 1073741824; // Convert bytes to GB

    const summary: UsageSummary = {
      documentReviews: {
        current: usage.document_reviews,
        limit: tier.document_reviews_per_month,
        remaining: Math.max(0, tier.document_reviews_per_month - usage.document_reviews),
        percentage: (usage.document_reviews / tier.document_reviews_per_month) * 100,
        canUse: usage.document_reviews < tier.document_reviews_per_month,
        overageRate: tier.overage_document_review_usd
      },
      storage: {
        current: storageGB,
        limit: tier.storage_gb,
        remaining: Math.max(0, tier.storage_gb - storageGB),
        percentage: (storageGB / tier.storage_gb) * 100,
        canUse: storageGB < tier.storage_gb,
        overageRate: tier.overage_storage_gb_usd
      },
      searches: {
        current: usage.searches,
        limit: tier.academic_searches_per_month,
        remaining: Math.max(0, tier.academic_searches_per_month - usage.searches),
        percentage: (usage.searches / tier.academic_searches_per_month) * 100,
        canUse: usage.searches < tier.academic_searches_per_month,
        overageRate: tier.overage_search_usd
      },
      studyGroups: {
        current: usage.study_groups,
        limit: tier.max_study_groups,
        remaining: Math.max(0, tier.max_study_groups - usage.study_groups),
        percentage: (usage.study_groups / tier.max_study_groups) * 100,
        canUse: usage.study_groups < tier.max_study_groups
      },
      videoMinutes: {
        current: usage.video_minutes,
        limit: tier.video_minutes_per_month,
        remaining: Math.max(0, tier.video_minutes_per_month - usage.video_minutes),
        percentage: (usage.video_minutes / tier.video_minutes_per_month) * 100,
        canUse: usage.video_minutes < tier.video_minutes_per_month,
        overageRate: tier.overage_video_minute_usd
      },
      tierName: tier.tier_name,
      overageCharges: await calculateOverageCharges(),
      estimatedBill: tier.monthly_price_usd + (await calculateOverageCharges())
    };

    console.log('🎵 [Count on Me] USAGE_SUMMARY_COMPLETE', {
      tier: summary.tierName,
      overages: summary.overageCharges
    });

    return summary;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] USAGE_SUMMARY_ERROR', error);
    return null;
  }
}

/**
 * Calculate overage charges
 * 🎵 Sovereign Frequency: "Money Money Money" - Calculating extra costs
 */
async function calculateOverageCharges(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase.rpc('calculate_overage_charges', {
      user_uuid: user.id
    });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] OVERAGE_CALC_ERROR', error);
    return 0;
  }
}

/**
 * Check if user can perform an action
 * 🎵 Sovereign Frequency: "Help Me Find My Way Home" - Checking limits
 */
export async function canPerformAction(actionType: 'document_review' | 'file_upload' | 'search' | 'video'): Promise<{
  allowed: boolean;
  reason?: string;
  overageRate?: number;
}> {
  console.log('🎵 [Help Me Find My Way Home] QUOTA_CHECK', { actionType });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    const { data, error } = await supabase.rpc('can_perform_action', {
      user_uuid: user.id,
      action_type: actionType
    });

    if (error) throw error;

    if (!data) {
      const summary = await getUsageSummary();
      const limitInfo = actionType === 'document_review' ? summary?.documentReviews :
                       actionType === 'search' ? summary?.searches :
                       actionType === 'video' ? summary?.videoMinutes : null;

      return {
        allowed: false,
        reason: `You've reached your ${actionType} limit. ${limitInfo?.overageRate ? `Additional usage: $${limitInfo.overageRate} per ${actionType}` : 'Upgrade your plan to continue.'}`,
        overageRate: limitInfo?.overageRate
      };
    }

    console.log('🎵 [Count on Me] QUOTA_CHECK_PASSED', { actionType });
    return { allowed: true };
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] QUOTA_CHECK_ERROR', error);
    return { allowed: false, reason: 'Unable to verify quota' };
  }
}

/**
 * Track a usage event
 * 🎵 Sovereign Frequency: "Count on Me" - Recording activity
 */
export async function trackUsageEvent(
  eventType: 'document_review' | 'file_upload' | 'academic_search' | 'video_call',
  resourceId?: string,
  unitsConsumed?: number,
  costUsd?: number,
  metadata?: Record<string, any>
): Promise<boolean> {
  console.log('🎵 [Count on Me] USAGE_EVENT_TRACK', { eventType, unitsConsumed });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('usage_events')
      .insert({
        user_id: user.id,
        event_type: eventType,
        resource_id: resourceId,
        units_consumed: unitsConsumed,
        cost_usd: costUsd,
        metadata
      });

    if (error) throw error;

    // Update usage counters
    await updateUsageCounters(eventType, unitsConsumed || 1);

    console.log('🎵 [Count on Me] USAGE_EVENT_TRACKED', { eventType });
    return true;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] USAGE_EVENT_ERROR', error);
    return false;
  }
}

/**
 * Update usage counters for current period
 */
async function updateUsageCounters(eventType: string, amount: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const field = eventType === 'document_review' ? 'document_reviews_count' :
                eventType === 'academic_search' ? 'academic_searches_count' :
                eventType === 'video_call' ? 'video_minutes_used' : null;

  if (!field) return;

  // Update usage counters - simple increment for now
  await supabase
    .from('user_usage')
    .update({ [field]: supabase.rpc('increment', { amount }) })
    .match({ user_id: user.id })
    .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    .lte('period_end', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString());
}

/**
 * Get tax rate for user's region
 * 🎵 Sovereign Frequency: "Tax Man" - Calculating regional tax
 */
export async function getTaxRate(regionCode?: string): Promise<number> {
  console.log('🎵 [Tax Man] TAX_RATE_FETCH', { regionCode });

  try {
    if (!regionCode) {
      // Try to detect user's region (could use IP geolocation)
      regionCode = 'US-CA'; // Default to California
    }

    const { data, error } = await supabase
      .from('tax_rates')
      .select('tax_rate')
      .eq('region_code', regionCode)
      .gte('effective_date', new Date().toISOString().split('T')[0])
      .or(`expires_date.is.null,expires_date.gte.${new Date().toISOString().split('T')[0]}`)
      .single();

    if (error) return 0;

    console.log('🎵 [Tax Man] TAX_RATE_FOUND', { rate: data.tax_rate });
    return data.tax_rate;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] TAX_RATE_ERROR', error);
    return 0;
  }
}

/**
 * Calculate total bill with tax
 * 🎵 Sovereign Frequency: "Money Money Money" - Final bill calculation
 */
export async function calculateTotalBill(regionCode?: string): Promise<{
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}> {
  console.log('🎵 [Money Money Money] BILL_CALCULATION');

  try {
    const summary = await getUsageSummary();
    if (!summary) {
      return { subtotal: 0, tax: 0, total: 0, taxRate: 0 };
    }

    const taxRate = await getTaxRate(regionCode);
    const subtotal = summary.estimatedBill;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    console.log('🎵 [Money Money Money] BILL_CALCULATED', {
      subtotal,
      tax,
      total,
      taxRate
    });

    return { subtotal, tax, total, taxRate };
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] BILL_CALC_ERROR', error);
    return { subtotal: 0, tax: 0, total: 0, taxRate: 0 };
  }
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
