-- Preload Credit Accounts from Experian Report
-- Date: January 17, 2026
-- Total Balance: $47,657 across 8 accounts
-- Credit Utilization: 92% ($38,930 used of $51,600 limit)
-- User: generalmanager81@gmail.com
-- UUID: eca49ca9-b4ae-4e0e-b78a-fa1811024781

INSERT INTO active_credit_accounts (
    user_id,
    creditor_name,
    account_number_last4,
    account_type,
    account_status,
    reported_balance,
    credit_limit,
    utilization_percent,
    current_apr,
    original_apr,
    account_opened,
    age_years,
    age_months,
    notes
) VALUES
-- Account 1: AMEX (Active)
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'AMEX',
    '0001', -- UPDATE with last 4 digits
    'credit_card',
    'open',
    3185.00,
    4000.00, -- ESTIMATED - update with actual limit
    80, -- ESTIMATED
    NULL, -- UPDATE with actual APR if known
    NULL, -- UPDATE with original APR if known
    '2015-01-01', -- PLACEHOLDER - update with actual opening date
    NULL, -- UPDATE with actual years
    NULL, -- UPDATE with actual months
    'Balance updated Jan 09, 2026'
),

-- Account 2: AMEX (Paid/Dormant)
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'AMEX',
    '0002', -- UPDATE with last 4 digits
    'credit_card',
    'open',
    0.00,
    5000.00, -- ESTIMATED
    0,
    NULL,
    NULL,
    '2015-01-01', -- PLACEHOLDER
    NULL,
    NULL,
    'Balance updated Jan 08, 2026 - Paid off or dormant'
),

-- Account 3: CAPITAL ONE
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'CAPITAL ONE',
    '0003', -- UPDATE with last 4 digits
    'credit_card',
    'open',
    5221.00,
    6500.00, -- ESTIMATED
    80, -- ESTIMATED
    NULL, -- UPDATE with actual APR
    NULL,
    '2015-01-01', -- PLACEHOLDER
    NULL,
    NULL,
    'Balance updated Dec 24, 2025'
),

-- Account 4: CAPITAL ONE (Largest Balance - HIGH PRIORITY)
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'CAPITAL ONE',
    '0004', -- UPDATE with last 4 digits
    'credit_card',
    'open',
    19438.00,
    19000.00, -- ESTIMATED - appears OVER LIMIT (102% utilization)
    102, -- OVER LIMIT
    NULL, -- UPDATE - likely high APR
    NULL,
    '2015-01-01', -- PLACEHOLDER
    NULL,
    NULL,
    'Balance updated Dec 16, 2025 - OVER LIMIT - Check for over-limit fee violations'
),

-- Account 5: CITICARDS CBNA
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'CITICARDS CBNA',
    '0005', -- UPDATE with last 4 digits
    'credit_card',
    'open',
    6524.00,
    6700.00, -- ESTIMATED
    97, -- Near limit
    NULL, -- UPDATE with actual APR
    NULL,
    '2015-01-01', -- PLACEHOLDER
    NULL,
    NULL,
    'Balance updated Dec 25, 2025 - Near limit'
),

-- Account 6: JPMCB CARD (Chase - Paid/Dormant)
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'JPMCB CARD',
    '0006', -- UPDATE with last 4 digits
    'credit_card',
    'open',
    0.00,
    8000.00, -- ESTIMATED
    0,
    NULL,
    NULL,
    '2015-01-01', -- PLACEHOLDER
    NULL,
    NULL,
    'Balance updated Dec 26, 2025 - Paid off or dormant'
),

-- Account 7: SYNCB/BELK (Synchrony Bank - Paid/Dormant)
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'SYNCB/BELK',
    '0007', -- UPDATE with last 4 digits
    'store_card',
    'open',
    0.00,
    2000.00, -- ESTIMATED - store cards typically lower limits
    0,
    NULL,
    NULL,
    '2015-01-01', -- PLACEHOLDER
    NULL,
    NULL,
    'Balance updated Dec 22, 2025 - Paid off or dormant'
),

-- Account 8: SYNCB/SAMS CLUB DC (Synchrony Bank - Sam's Club)
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'SYNCB/SAMS CLUB DC',
    '0008', -- UPDATE with last 4 digits
    'store_card',
    'open',
    5055.00,
    5000.00, -- ESTIMATED - appears OVER LIMIT (101%)
    101, -- OVER LIMIT
    NULL, -- UPDATE - store cards often have high APRs (25-30%)
    NULL,
    '2015-01-01', -- PLACEHOLDER
    NULL,
    NULL,
    'Balance updated Jan 04, 2026 - OVER LIMIT - Check for violations'
),

-- Account 9: BANK OF AMERICA AUTO LOAN
(
    'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid,
    'BANK OF AMERICA',
    '4180',
    'auto_loan',
    'open',
    49696.00,
    71157.00, -- Original loan amount as "limit"
    70, -- 70% of original loan still owed
    NULL, -- UPDATE with actual APR from loan documents
    NULL, -- UPDATE with original APR if rate changed
    '2024-04-30',
    1, -- 1 year old
    9, -- 9 months old (opened Apr 2024, now Jan 2026)
    'AUTO LOAN - 72 month term, Pays As Agreed, $21,461 paid of $71,157 original. Last activity Dec 2025. Report date Jan 17, 2026.'
);

-- Summary Statistics from Experian Report:
-- Total Credit Card Balance: $47,657
-- Total Auto Loan Balance: $49,696
-- TOTAL DEBT TRACKED: $97,353
-- Total Credit Used: $38,930 (credit cards)
-- Total Credit Limit: $51,600 (estimated, credit cards only)
-- Overall Utilization: 92% (credit cards)
-- Credit Card Accounts: 8 (5 with balances, 3 dormant)
-- Auto Loan Accounts: 1 (paying as agreed)
-- OVER LIMIT accounts: 2 (Capital One, Sam's Club)

-- NEXT STEPS:
-- 1. Replace 'YOUR_USER_ID_HERE' with your actual user_id
-- 2. Update account_number_last4 with real last 4 digits
-- 3. Update credit_limit with actual limits from statements
-- 4. Update current_apr with actual APRs (critical for violation detection)
-- 5. Update account_opened dates with actual opening dates
-- 6. Update age_years and age_months with actual account ages
-- 7. If you know original_apr, add it to detect rate increase violations

-- To get your user_id, run:
-- SELECT id FROM auth.users WHERE email = 'your@email.com';
