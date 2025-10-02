-- Enforce super admin status for key users everywhere in the system
-- This trigger ensures these emails always have is_super_admin=true and role='super_admin'

create or replace function enforce_super_admins()
returns trigger as $$
begin
  if new.email in (
    'generalmanager81@gmail.com',
    'christla@howardjanitorial.net',
    'a.r.barnett11@gmail.com'
  ) then
    new.is_super_admin := true;
    new.role := 'super_admin';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Attach to users table for inserts and updates

drop trigger if exists trg_enforce_super_admins_insert on public.users;
create trigger trg_enforce_super_admins_insert
  before insert on public.users
  for each row execute function enforce_super_admins();

drop trigger if exists trg_enforce_super_admins_update on public.users;
create trigger trg_enforce_super_admins_update
  before update on public.users
  for each row execute function enforce_super_admins();

-- This guarantees these users always retain super admin privileges, even if edited.
