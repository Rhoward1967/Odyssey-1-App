-- Seed super admin users for Odyssey-1
-- These users will always have super admin privileges and bypass all system limits

insert into public.users (email, name, role, is_super_admin, company_id)
values
  ('generalmanager81@gmail.com', 'Rickey Howard', 'super_admin', true, 'your_company_id'),
  ('christla@howardjanitorial.net', 'Christla Howard', 'super_admin', true, 'your_company_id'),
  ('a.r.barnett11@gmail.com', 'Ahmad Barnett', 'super_admin', true, 'your_company_id')
on conflict (email) do update set
  role = 'super_admin',
  is_super_admin = true;

-- Replace 'your_company_id' with your actual company_id if needed.
-- This script ensures these users always have super admin status.
