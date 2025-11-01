-- Add trial tracking columns to auth.users metadata
-- We'll use user_metadata to store trial info

-- Add a trigger to automatically set trial_start on first login
CREATE OR REPLACE FUNCTION public.set_trial_start()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set trial_start if it doesn't exist (first login)
  IF NEW.raw_user_meta_data->>'trial_start_date' IS NULL THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{trial_start_date}',
      to_jsonb(now()::text)
    );
    
    NEW.raw_user_meta_data = jsonb_set(
      NEW.raw_user_meta_data,
      '{trial_days}',
      '7'::jsonb
    );
    
    NEW.raw_user_meta_data = jsonb_set(
      NEW.raw_user_meta_data,
      '{subscription_status}',
      '"trial"'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_trial ON auth.users;
CREATE TRIGGER on_auth_user_trial
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_trial_start();

COMMENT ON FUNCTION public.set_trial_start IS 'Automatically sets 7-day trial start date for new users';
