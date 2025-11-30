-- Migration: Create governance_principles table and insert the 9 foundational principles
-- Date: 2025-11-25

CREATE TABLE IF NOT EXISTS public.governance_principles (
    id SERIAL PRIMARY KEY,
    principle_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL
);

-- Insert the 9 foundational principles
INSERT INTO public.governance_principles (principle_number, title, description) VALUES
  (1, 'Sovereign Creation', 'We shape our reality through intentional thought and action'),
  (2, 'Divine Essence', 'Each individual possesses inherent divine nature'),
  (3, 'The Hard Drive', 'Our true self stored beneath layers of programming'),
  (4, 'The Virus', 'External systems that hijack our operating system'),
  (5, 'Consent-Based Reality', 'No authority without explicit consent'),
  (6, 'Truth & Transparency', 'All actions must be auditable and verifiable'),
  (7, 'Self-Preservation', 'Systems must protect their own integrity'),
  (8, 'Continuous Evolution', 'Growth through adaptation and learning'),
  (9, 'Resource Efficiency', 'Minimize waste, maximize value')
ON CONFLICT (principle_number) DO NOTHING;

-- Enable RLS and allow only read access for R.O.M.A.N. (service role), no write access
ALTER TABLE public.governance_principles ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for R.O.M.A.N. (replace 'service_role' with actual role if different)
CREATE POLICY roman_read_principles ON public.governance_principles
  FOR SELECT
  TO service_role
  USING (true);

-- Deny INSERT/UPDATE/DELETE for all (including R.O.M.A.N.) by not creating policies for those actions
-- (Optionally, you can explicitly REVOKE these if needed)
