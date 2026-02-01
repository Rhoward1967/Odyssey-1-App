-- ============================================================================
-- ADD ARCHANA JITENDRA - ACCOUNTANT
-- Email: anjujit@gmail.com
-- Role: Company Accountant (Taxes, Books, Income/Expenses)
-- ============================================================================

-- Step 1: Create auth user (if she doesn't already exist)
-- Note: Run this from Supabase Dashboard → Authentication → Invite User
-- Email: anjujit@gmail.com
-- Or have her sign up and then run the permissions below

-- Step 2: Add her to app_admins with accountant privileges
-- (Replace 'USER_ID_HERE' with her actual UUID from auth.users after she signs up)

-- Helper function to add accountant by email (run after she signs up)
CREATE OR REPLACE FUNCTION public.add_accountant_by_email(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_grantor_id uuid;
BEGIN
    -- Find user by email
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users', p_email;
    END IF;
    
    -- Find Rickey as grantor
    SELECT id INTO v_grantor_id 
    FROM auth.users 
    WHERE email IN ('christlahoward63@gmail.com', 'rickey@howardjanitorial.net')
    LIMIT 1;
    
    -- Add to app_admins
    INSERT INTO public.app_admins (user_id, is_active, granted_by, notes)
    VALUES (
        v_user_id,
        true,
        COALESCE(v_grantor_id, v_user_id),
        'Company Accountant - Full access to books, taxes, income, expenses, invoicing'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        is_active = true,
        notes = 'Company Accountant - Full access to books, taxes, income, expenses, invoicing',
        updated_at = NOW();
    
    RAISE NOTICE '✅ % added as Company Accountant', p_email;
END;
$$;

-- Try to add Archana now (will succeed if she already has an account)
DO $$
BEGIN
    PERFORM public.add_accountant_by_email('anjujit@gmail.com');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Archana not yet in auth.users';
    RAISE NOTICE '   Invite her first, then run: SELECT public.add_accountant_by_email(''anjujit@gmail.com'');';
END;
$$;

-- Step 3: Grant specific table permissions for accountant role

-- Invoices (full access - view, create, edit)
GRANT SELECT, INSERT, UPDATE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.recurring_invoices TO authenticated;

-- Customers (view, edit for billing purposes)
GRANT SELECT, UPDATE ON public.customers TO authenticated;

-- Payments (full access)
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_transactions TO authenticated;

-- Expenses (full access)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;

-- Bank accounts (view only - for reconciliation)
GRANT SELECT ON public.company_bank_accounts TO authenticated;

-- Tax records (full access)
GRANT SELECT, INSERT, UPDATE ON public.tax_filings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tax_calculations TO authenticated;

-- Employees/Payroll (view for tax/payroll purposes)
GRANT SELECT ON public.employees TO authenticated;
GRANT SELECT ON public.paystubs TO authenticated;

-- Bids (view for revenue tracking)
GRANT SELECT ON public.bids TO authenticated;

RAISE NOTICE '';
RAISE NOTICE '═══════════════════════════════════════════════════════════';
RAISE NOTICE '📊 ACCOUNTANT SETUP COMPLETE';
RAISE NOTICE '═══════════════════════════════════════════════════════════';
RAISE NOTICE '';
RAISE NOTICE 'Archana Jitendra (anjujit@gmail.com) has access to:';
RAISE NOTICE '  ✅ Invoices & Recurring Billing';
RAISE NOTICE '  ✅ Customer Management (billing info)';
RAISE NOTICE '  ✅ Payments & Transactions';
RAISE NOTICE '  ✅ Expenses';
RAISE NOTICE '  ✅ Bank Reconciliation (view)';
RAISE NOTICE '  ✅ Tax Filings & Calculations';
RAISE NOTICE '  ✅ Payroll Records (view)';
RAISE NOTICE '  ✅ Revenue Tracking (bids)';
RAISE NOTICE '';
RAISE NOTICE 'She can access via:';
RAISE NOTICE '  • AutomatedInvoicing.tsx (invoice management)';
RAISE NOTICE '  • Budget.tsx (expenses tracking)';
RAISE NOTICE '  • AdminDashboard.tsx (financial overview)';
RAISE NOTICE '';
RAISE NOTICE '═══════════════════════════════════════════════════════════';
