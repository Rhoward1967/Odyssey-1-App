-- Update subscription plans with new tier features
UPDATE subscription_plans 
SET 
  features = jsonb_set(
    features,
    '{theme_access}',
    '{"type": "limited", "count": 5, "themes": ["modern", "classic", "minimal", "professional", "startup"]}'::jsonb
  )
WHERE tier = 'professional' AND price_monthly = 99;

UPDATE subscription_plans 
SET 
  features = jsonb_set(
    jsonb_set(
      features,
      '{theme_access}',
      '{"type": "full", "count": 17, "premium_themes": true, "all_industry_themes": true}'::jsonb
    ),
    '{knowledge_bases}',
    '{"type": "full", "count": 17, "all_industry_kbs": true}'::jsonb
  )
WHERE tier = 'business' AND price_monthly = 299;

UPDATE subscription_plans 
SET 
  features = jsonb_set(
    jsonb_set(
      jsonb_set(
        features,
        '{theme_access}',
        '{"type": "unlimited", "premium": true, "custom_upload": true, "code_editor": true}'::jsonb
      ),
      '{knowledge_bases}',
      '{"type": "unlimited", "custom_upload": true, "create_custom": true}'::jsonb
    ),
    '{developer_tools}',
    '{"css_editor": true, "js_editor": true, "staging_environment": true, "api_access": true}'::jsonb
  )
WHERE tier = 'enterprise' AND price_monthly = 999;

-- Add industry theme mapping table
CREATE TABLE IF NOT EXISTS industry_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_name text NOT NULL UNIQUE,
  theme_id text NOT NULL,
  knowledge_base_id uuid REFERENCES knowledge_bases(id),
  preview_image_url text,
  description text,
  color_scheme jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert the 17 industry themes
INSERT INTO industry_themes (industry_name, theme_id, description, color_scheme) VALUES
  ('Lawyer', 'theme_lawyer', 'Professional legal services theme with trust-building elements', '{"primary": "#1a365d", "secondary": "#d4af37", "accent": "#2c5282"}'),
  ('Plumber', 'theme_plumber', 'Reliable plumbing services with emergency contact prominence', '{"primary": "#2563eb", "secondary": "#fbbf24", "accent": "#dc2626"}'),
  ('Baker', 'theme_baker', 'Warm, inviting bakery theme with product showcase', '{"primary": "#f59e0b", "secondary": "#fef3c7", "accent": "#d97706"}'),
  ('Doctor', 'theme_doctor', 'Clean medical practice theme with appointment booking', '{"primary": "#0ea5e9", "secondary": "#f0f9ff", "accent": "#0369a1"}'),
  ('Mechanic', 'theme_mechanic', 'Automotive repair theme with service listings', '{"primary": "#374151", "secondary": "#f59e0b", "accent": "#dc2626"}'),
  ('Restaurant', 'theme_restaurant', 'Culinary showcase with menu and reservations', '{"primary": "#dc2626", "secondary": "#fef2f2", "accent": "#991b1b"}'),
  ('Salon', 'theme_salon', 'Beauty services with booking and portfolio', '{"primary": "#ec4899", "secondary": "#fdf2f8", "accent": "#be185d"}'),
  ('Gym', 'theme_gym', 'Fitness center with class schedules and membership', '{"primary": "#16a34a", "secondary": "#f0fdf4", "accent": "#15803d"}'),
  ('Realtor', 'theme_realtor', 'Property listings with search and virtual tours', '{"primary": "#0891b2", "secondary": "#ecfeff", "accent": "#0e7490"}'),
  ('Electrician', 'theme_electrician', 'Electrical services with safety focus', '{"primary": "#f59e0b", "secondary": "#fffbeb", "accent": "#d97706"}'),
  ('Accountant', 'theme_accountant', 'Financial services with trust and precision', '{"primary": "#059669", "secondary": "#f0fdf4", "accent": "#047857"}'),
  ('Photographer', 'theme_photographer', 'Visual portfolio with booking system', '{"primary": "#7c3aed", "secondary": "#faf5ff", "accent": "#6d28d9"}'),
  ('Dentist', 'theme_dentist', 'Dental practice with appointment scheduling', '{"primary": "#06b6d4", "secondary": "#ecfeff", "accent": "#0891b2"}'),
  ('Contractor', 'theme_contractor', 'Construction services with project gallery', '{"primary": "#ea580c", "secondary": "#fff7ed", "accent": "#c2410c"}'),
  ('Consultant', 'theme_consultant', 'Professional consulting with expertise showcase', '{"primary": "#4f46e5", "secondary": "#eef2ff", "accent": "#4338ca"}'),
  ('Florist', 'theme_florist', 'Floral arrangements with seasonal offerings', '{"primary": "#db2777", "secondary": "#fdf2f8", "accent": "#be185d"}'),
  ('Pet Services', 'theme_pet_services', 'Animal care with appointment booking', '{"primary": "#14b8a6", "secondary": "#f0fdfa", "accent": "#0f766e"}')
ON CONFLICT (industry_name) DO NOTHING;
