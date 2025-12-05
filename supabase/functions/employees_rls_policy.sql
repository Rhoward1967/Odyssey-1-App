-- RLS policy for employees SELECT by organization membership
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_employees_by_org ON public.employees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE user_organizations.organization_id = employees.organization_id
    AND user_organizations.user_id = auth.uid()
  )
);
