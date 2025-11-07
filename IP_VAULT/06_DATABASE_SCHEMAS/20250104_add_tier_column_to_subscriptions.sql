-- Add missing tier column to subscriptions table

-- Add tier column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

-- Add check constraint for valid tier values
ALTER TABLE public.subscriptions 
ADD CONSTRAINT valid_tier_values 
CHECK (tier IN ('free', 'starter', 'professional', 'enterprise'));

-- Update existing records to have 'free' tier
UPDATE public.subscriptions 
SET tier = 'free' 
WHERE tier IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier 
ON public.subscriptions(tier);

-- Add comment
COMMENT ON COLUMN public.subscriptions.tier IS 'Subscription tier: free, starter, professional, enterprise';

-- Grant permissions
GRANT SELECT, UPDATE ON public.subscriptions TO authenticated;
