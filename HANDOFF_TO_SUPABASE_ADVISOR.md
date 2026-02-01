# URGENT: RLS Policy Gaps Blocking Frontend

**From:** Frontend Agent  
**To:** Supabase Advisor  
**Priority:** CRITICAL - Application is showing blank screen

## Problem Summary

All frontend queries to `customers` and `company_profiles` tables are returning 400/500 errors, blocking the entire dashboard. User is authenticated (`eca49ca9-b4ae-4e0e-b78a-fa1811024781`) but queries are being rejected.

## Failing Queries (from Console)

```
GET /rest/v1/customers?select=*&or=(user_id.eq.eca49ca9...,user_id.is.null) → 500 Error
GET /rest/v1/company_profiles?select=*&user_id=eq.eca49ca9... → 500 Error
GET /rest/v1/recurring_invoices?select=*,customers!recurring_invoices_customer_id_fkey(...) → 400 Error
GET /rest/v1/invoices?select=*,customers!invoices_customer_id_fkey(...) → 500 Error
```

## Root Cause

RLS is enabled on these tables but there are **NO SELECT policies** defined:

- ✅ `invoices` - Has policies (working)
- ✅ `recurring_invoices` - Has policies (working)
- ❌ `customers` - RLS enabled, NO SELECT policy (blocking JOINs)
- ❌ `company_profiles` - RLS enabled, NO SELECT policy (blocking queries)

## What Needs to Be Fixed

### 1. `customers` Table

**Required Policies:**

- SELECT: Allow users to view their own customers + legacy null user_id records
- INSERT: Allow users to create their own customers
- UPDATE: Allow users to update their own customers

**Business Logic:**

- Users should see customers where `user_id = auth.uid()`
- Users should ALSO see customers where `user_id IS NULL` (14-month data fix created these)

### 2. `company_profiles` Table

**Required Policies:**

- SELECT: Allow users to view their own profile
- UPDATE: Allow users to update their own profile

## Expected Behavior After Fix

Frontend queries should work:

```sql
-- This should return 14 customers (user's own data)
SELECT * FROM customers WHERE user_id = 'eca49ca9...' OR user_id IS NULL;

-- This should return 1 profile
SELECT * FROM company_profiles WHERE user_id = 'eca49ca9...';

-- This JOIN should work
SELECT *, customers(company_name)
FROM recurring_invoices
WHERE is_active = true;
```

## Files Already Created

- `RLS_HARDENING.sql` - Has policies for invoices/invoice_line_items/recurring_invoices
- `FIX_CUSTOMERS_RLS.sql` - I created this but couldn't execute it (exit code 1)

## Request to Supabase Advisor

Please:

1. Verify RLS status on `customers` and `company_profiles` tables
2. Add SELECT policies for authenticated users
3. Test that JOINs work after policy deployment
4. Confirm user `eca49ca9-b4ae-4e0e-b78a-fa1811024781` can query all tables

## User Impact

- Dashboard shows blank screen
- User cannot see $14,283.07 monthly revenue
- User cannot see $61,030 annual contracts
- Invoicing page completely broken
- User losing confidence in system

Thank you for handling the backend security layer.
