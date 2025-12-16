# ODYSSEY-1 Developer Onboarding Guide

**Welcome to the ODYSSEY-1 Team**  
**Version:** 2.0.0  
**Last Updated:** December 15, 2025

---

## Welcome! 🎉

You're joining the team behind the world's FIRST Constitutional AI platform with autonomous governance. This guide will help you get productive quickly.

---

## Table of Contents

1. [Your First Day](#your-first-day)
2. [Understanding the Codebase](#understanding-the-codebase)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing Requirements](#testing-requirements)
6. [Common Tasks](#common-tasks)
7. [Getting Help](#getting-help)

---

## Your First Day

### Prerequisites

Before you start, ensure you have:

- [ ] GitHub account added to repository
- [ ] Supabase project access granted
- [ ] Discord server invite accepted
- [ ] Development machine meets requirements (see `docs/SETUP_GUIDE.md`)
- [ ] 1Password/secrets manager access for environment variables

### Setup (2-3 hours)

#### Step 1: Clone & Install

```bash
git clone https://github.com/Rhoward1967/Odyssey-1-App.git
cd Odyssey-1-App
npm install
```

#### Step 2: Environment Configuration

```bash
cp .env.example .env
```

Get secrets from team lead and add to `.env`:
- Supabase URL and keys
- Stripe keys
- Discord bot token
- AI provider keys (Anthropic, OpenAI)

#### Step 3: Verify Setup

```bash
# Run tests
npm test               # Should show 46/46 passing
npm run test:e2e       # Should show 7/7 passing

# Start dev server
npm run dev            # Should open http://localhost:8080

# Start R.O.M.A.N. bot (separate terminal)
node src/start-bot.ts  # Should show "Constitutional Core Initialized"
```

**Expected Output:**
```
✅ 46 unit tests passing
✅ 7 E2E tests passing (28.6s)
✅ Dev server running on http://localhost:8080
✅ R.O.M.A.N. Constitutional Core: 3/3 tests passing
```

If you see errors, check `docs/SETUP_GUIDE.md` troubleshooting section.

---

## Understanding the Codebase

### High-Level Architecture

```
Frontend (React + TypeScript)
    ↓
Supabase (PostgreSQL + Edge Functions)
    ↓
R.O.M.A.N. (Constitutional AI Governance)
```

### Directory Structure

```
Odyssey-1-App/
├── src/                           # Frontend application
│   ├── components/                # React components (200+)
│   │   ├── Admin.tsx              # Admin dashboard
│   │   ├── RomanDashboard.tsx     # R.O.M.A.N. monitoring
│   │   └── ...
│   ├── pages/                     # Page-level components
│   │   ├── Index.tsx              # Homepage
│   │   ├── LoginPage.tsx          # Authentication
│   │   └── NotFound.tsx           # 404 page
│   ├── services/                  # API integrations
│   │   ├── authService.ts         # Authentication
│   │   ├── bidProposalService.ts  # Bidding system
│   │   ├── discord-bot.ts         # R.O.M.A.N. Discord bot
│   │   └── ...
│   ├── lib/                       # Utilities & core logic
│   │   ├── supabase.ts            # Supabase client
│   │   ├── roman-constitutional-core.ts  # Constitutional AI
│   │   └── ErrorBoundary.tsx      # Global error handler
│   └── hooks/                     # Custom React hooks
├── supabase/
│   ├── functions/                 # Edge Functions (Deno)
│   │   ├── ai-chat/               # Multi-provider AI chat
│   │   ├── roman-processor/       # R.O.M.A.N. command handler
│   │   └── ...
│   └── migrations/                # Database schema changes
├── e2e/                           # Playwright E2E tests
├── docs/                          # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── SETUP_GUIDE.md
│   ├── ROMAN_OPERATIONS_MANUAL.md
│   └── DEVELOPER_ONBOARDING.md    # This file
└── .github/workflows/             # CI/CD pipelines
```

---

### Key Concepts

#### 1. Constitutional AI (R.O.M.A.N.)

**What it is:** An autonomous AI governance system that validates all critical actions against Sacred Geometry principles.

**Four Laws:**
1. **Law of Inhabitance** - No harm to life/data
2. **Harmonic Attraction** - Use resonance over brute force
3. **Total Coherence** - Minimize system entropy
4. **Structural Integrity** - Follow Golden Ratio (Phi = 1.618)

**Where to find it:**
- Implementation: `src/lib/roman-constitutional-core.ts`
- Integration: `src/services/discord-bot.ts`
- Operations Manual: `docs/ROMAN_OPERATIONS_MANUAL.md`

**When you'll use it:**
- Deploying code
- Database migrations
- Deleting data
- Any "destructive" operation

**Example:**
```typescript
import { isActionCompliant, ActionData } from '@/lib/roman-constitutional-core';

const action: ActionData = {
  method_type: 'harmonic_resonance',
  risk_to_life: 0.0,              // No danger
  entropy_increase: 0.001,         // Minimal chaos
  geometric_ratio: 1.618,          // Golden Ratio
  description: "Deploy feature-x"
};

const result = isActionCompliant(action, systemEntropy);

if (!result.compliant) {
  console.error("❌ BLOCKED:", result.violations);
  return; // Don't proceed
}

// Safe to proceed
await deployFeature();
```

---

#### 2. Row Level Security (RLS)

**What it is:** PostgreSQL-level access control. Users only see their own data.

**How it works:**
```sql
-- Example RLS policy
CREATE POLICY "Users can only see their org's customers"
ON customers FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);
```

**Important:**
- ALL tables have RLS enabled
- Service role (R.O.M.A.N.) bypasses RLS
- Test with actual user sessions, not service role

**Common mistake:**
```typescript
// ❌ WRONG - Uses anon key, respects RLS
const { data } = await supabase
  .from('customers')
  .select('*');  // Only returns YOUR org's customers

// ✅ RIGHT - Filters explicitly (even though RLS does it too)
const { data } = await supabase
  .from('customers')
  .select('*')
  .eq('organization_id', currentOrgId);  // Explicit = clearer intent
```

---

#### 3. Magic Link Authentication

**What it is:** Passwordless login via email.

**Flow:**
1. User enters email
2. Supabase sends magic link
3. User clicks link
4. Redirected to app with session token
5. Frontend stores session in localStorage

**Implementation:**
```typescript
// Request magic link
await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'http://localhost:8080/auth/callback'
  }
});

// Handle callback (in /auth/callback route)
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  navigate('/app');
}
```

**No passwords!** Never ask for passwords. This is intentional.

---

#### 4. Supabase Edge Functions

**What they are:** Serverless functions running on Deno runtime at the edge (globally distributed).

**When to use:**
- AI API calls (keeps keys server-side)
- Stripe webhooks
- Complex business logic
- Server-side validation

**Example Function:**
```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const { param1, param2 } = await req.json();
    
    // Create Supabase client (uses service role)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Do work
    const result = await doSomething(param1, param2);
    
    // Return response
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

**Deploy:**
```bash
supabase functions deploy my-function
```

---

## Development Workflow

### Branch Strategy

```
main (production) ← protected, requires approval
  ↑
dev-lab (staging) ← protected, CI/CD auto-deploys
  ↑
feature/your-feature-name ← your work
```

### Starting a New Feature

```bash
# 1. Start from latest dev-lab
git checkout dev-lab
git pull origin dev-lab

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes
# ... code code code ...

# 4. Commit frequently
git add src/components/NewComponent.tsx
git commit -m "feat: Add NewComponent for feature X"

# 5. Push to GitHub
git push origin feature/your-feature-name

# 6. Create Pull Request on GitHub
# → CI/CD runs automatically (lint, test, build)
# → Request review from team lead
# → Once approved, merge to dev-lab
```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code restructure (no behavior change)
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples:**
```bash
git commit -m "feat: Add customer search to dashboard"
git commit -m "fix: Resolve 404 page infinite re-render issue"
git commit -m "docs: Update API documentation for bid endpoints"
git commit -m "test: Add E2E test for invoice payment flow"
```

---

### Pull Request Checklist

Before submitting PR:

- [ ] Code follows style guide (see below)
- [ ] All tests passing (`npm test && npm run test:e2e`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] TypeScript types correct (`npx tsc --noEmit`)
- [ ] Documentation updated (if public API changed)
- [ ] R.O.M.A.N. Constitutional validation passed (if critical operation)
- [ ] Tested manually in browser
- [ ] Screenshots/video added (for UI changes)

**PR Template:**
```markdown
## What does this PR do?
Brief description of changes.

## How to test
1. Step 1
2. Step 2
3. Expected result

## Screenshots/Video
[Attach if UI change]

## Checklist
- [ ] Tests passing
- [ ] Linting clean
- [ ] Documentation updated
- [ ] Tested in Chrome & Firefox
```

---

## Code Standards

### TypeScript

**Always use types:**
```typescript
// ❌ BAD
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ GOOD
interface LineItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function calculateTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**Prefer interfaces over types:**
```typescript
// ✅ GOOD
interface User {
  id: string;
  email: string;
  name: string | null;
}

// ⚠️ OK for unions
type Status = 'pending' | 'approved' | 'rejected';
```

---

### React

**Use functional components with hooks:**
```typescript
// ✅ GOOD
export function CustomerList({ organizationId }: { organizationId: number }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [organizationId]);

  async function fetchCustomers() {
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organizationId);
    
    setCustomers(data || []);
    setLoading(false);
  }

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {customers.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}
```

**Extract complex logic to custom hooks:**
```typescript
// src/hooks/useCustomers.ts
export function useCustomers(organizationId: number) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [organizationId]);

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (fetchError) throw fetchError;
      
      setCustomers(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { customers, loading, error, refetch: fetchCustomers };
}

// Usage in component
function CustomerList({ organizationId }: Props) {
  const { customers, loading, error } = useCustomers(organizationId);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* render customers */}</div>;
}
```

---

### Error Handling

**Always handle errors:**
```typescript
// ❌ BAD
async function deleteCustomer(id: number) {
  await supabase.from('customers').delete().eq('id', id);
  // What if it fails?
}

// ✅ GOOD
async function deleteCustomer(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Log success to R.O.M.A.N.
    await supabase.from('system_logs').insert({
      severity: 'info',
      source: 'customer_service',
      message: `Customer ${id} deleted`,
      metadata: { customer_id: id }
    });
    
    return { success: true };
  } catch (err) {
    // Log error to R.O.M.A.N.
    await supabase.from('system_logs').insert({
      severity: 'error',
      source: 'customer_service',
      message: `Failed to delete customer ${id}: ${err.message}`,
      metadata: { 
        customer_id: id,
        error: err.message,
        stack: err.stack
      }
    });
    
    return { 
      success: false, 
      error: err.message 
    };
  }
}
```

---

### Supabase Queries

**Always check for errors:**
```typescript
// ❌ BAD
const { data } = await supabase.from('customers').select('*');
console.log(data[0].name); // Crashes if error

// ✅ GOOD
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('organization_id', orgId);

if (error) {
  console.error('Failed to fetch customers:', error);
  return [];
}

return data || [];
```

**Use transactions for related operations:**
```typescript
// ✅ GOOD - Multiple inserts that must all succeed
const { data: bid, error: bidError } = await supabase
  .from('bids')
  .insert({ 
    customer_id: customerId,
    total: 5000
  })
  .select()
  .single();

if (bidError) throw bidError;

const { error: itemsError } = await supabase
  .from('bid_items')
  .insert([
    { bid_id: bid.id, description: 'Service A', amount: 2000 },
    { bid_id: bid.id, description: 'Service B', amount: 3000 }
  ]);

if (itemsError) {
  // Rollback: delete the bid
  await supabase.from('bids').delete().eq('id', bid.id);
  throw itemsError;
}
```

---

## Testing Requirements

### Unit Tests

**Coverage target:** 80%

**What to test:**
- Business logic functions
- Utility functions
- Service methods
- React hooks

**Example:**
```typescript
// src/services/__tests__/bidProposalService.test.ts
import { describe, it, expect } from 'vitest';
import { calculateBidTotal } from '../bidProposalService';

describe('calculateBidTotal', () => {
  it('should calculate subtotal from line items', () => {
    const items = [
      { description: 'Service A', amount: 1000, quantity: 2 },
      { description: 'Service B', amount: 500, quantity: 1 }
    ];
    
    const result = calculateBidTotal(items, 0.08); // 8% tax
    
    expect(result.subtotal).toBe(2500);
    expect(result.tax).toBe(200);
    expect(result.total).toBe(2700);
  });
  
  it('should handle empty items array', () => {
    const result = calculateBidTotal([], 0.08);
    
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });
});
```

**Run tests:**
```bash
npm test                    # All tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:ui             # Visual UI
```

---

### E2E Tests

**Coverage target:** All critical user flows

**What to test:**
- Authentication flow
- Main user journeys
- Payment flows
- Error scenarios

**Example:**
```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('User can complete checkout', async ({ page }) => {
  // Navigate to login
  await page.goto('http://localhost:8080/login');
  
  // Enter email for magic link
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  
  // Wait for magic link sent message
  await expect(page.locator('text=Check your email')).toBeVisible();
  
  // In real test, would click link from email
  // For now, mock the session
  
  // ... rest of test
});
```

**Run E2E tests:**
```bash
npm run test:e2e            # Headless
npm run test:e2e:ui         # Interactive
npm run test:e2e:debug      # With debugger
```

---

## Common Tasks

### Adding a New Page

1. **Create page component:**
```typescript
// src/pages/NewFeature.tsx
export default function NewFeature() {
  return (
    <div>
      <h1>New Feature</h1>
      {/* Your content */}
    </div>
  );
}
```

2. **Add route:**
```typescript
// src/App.tsx
import NewFeature from '@/pages/NewFeature';

// Inside <Routes>
<Route path="/app/new-feature" element={
  <ErrorBoundary>
    <NewFeature />
  </ErrorBoundary>
} />
```

3. **Add navigation:**
```typescript
// src/components/Sidebar.tsx
<Link to="/app/new-feature">
  <FeatureIcon />
  New Feature
</Link>
```

4. **Add E2E test:**
```typescript
// e2e/new-feature.spec.ts
test('New feature page loads', async ({ page }) => {
  await page.goto('http://localhost:8080/app/new-feature');
  await expect(page.locator('h1:has-text("New Feature")')).toBeVisible();
});
```

---

### Adding a Database Table

1. **Create migration:**
```bash
supabase migration new add_new_table
```

2. **Write SQL:**
```sql
-- supabase/migrations/20251215000000_add_new_table.sql
CREATE TABLE new_table (
  id bigserial PRIMARY KEY,
  organization_id bigint REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_new_table_org ON new_table(organization_id);
CREATE INDEX idx_new_table_status ON new_table(status);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "Users can see their org's records"
ON new_table FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their org's records"
ON new_table FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);
```

3. **Test locally:**
```bash
supabase db push
```

4. **Create TypeScript types:**
```typescript
// src/types/database.ts
export interface NewTableRow {
  id: number;
  organization_id: number;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

5. **Deploy to staging:**
```bash
supabase link --project-ref STAGING_REF
supabase db push
```

---

### Debugging R.O.M.A.N. Issues

**Check if Constitutional Core is running:**
```bash
# In Discord
@R.O.M.A.N. status
```

**View recent R.O.M.A.N. events:**
```sql
SELECT * FROM ops.roman_events 
ORDER BY timestamp DESC 
LIMIT 50;
```

**Check for Constitutional violations:**
```sql
SELECT * FROM ops.roman_events 
WHERE event_type = 'rejection'
ORDER BY timestamp DESC 
LIMIT 20;
```

**Test Constitutional validation:**
```typescript
import { isActionCompliant } from '@/lib/roman-constitutional-core';

const result = isActionCompliant({
  method_type: 'harmonic_resonance',
  risk_to_life: 0.0,
  entropy_increase: 0.001,
  geometric_ratio: 1.618
}, 0.05);

console.log('Compliant:', result.compliant);
console.log('Violations:', result.violations);
```

---

## Getting Help

### Resources

📚 **Documentation:**
- `docs/API_DOCUMENTATION.md` - API reference
- `docs/DATABASE_SCHEMA.md` - Database structure
- `docs/SETUP_GUIDE.md` - Environment setup
- `docs/ROMAN_OPERATIONS_MANUAL.md` - R.O.M.A.N. operations
- `docs/DEVELOPER_ONBOARDING.md` - This guide

🔍 **Search Codebase:**
```bash
# Find where something is used
grep -r "functionName" src/

# Find component definition
grep -r "export default function ComponentName" src/
```

🤖 **Ask R.O.M.A.N.:**
```
# In Discord
@R.O.M.A.N. How do I [task]?
@R.O.M.A.N. What's the status of [system]?
```

👥 **Team:**
- Rickey Howard (Creator) - rhoward@hjsservices.us
- Discord: #dev-support channel
- GitHub Issues: For bugs and feature requests

---

## Your First Contribution

Ready to contribute? Here's a good first issue:

### Task: Add a New Test

1. Pick any service file in `src/services/`
2. Create test file: `src/services/__tests__/[filename].test.ts`
3. Write 3-5 tests covering main functions
4. Ensure tests pass: `npm test`
5. Create PR with title: `test: Add tests for [service]`

This will help you:
- ✅ Practice TypeScript
- ✅ Learn our testing patterns
- ✅ Understand business logic
- ✅ Go through the PR process

---

## Quick Reference Card

```bash
# Daily Commands
npm run dev             # Start dev server
npm test                # Run unit tests
npm run test:e2e        # Run E2E tests
npm run lint            # Check code style

# Git Workflow
git checkout dev-lab
git pull origin dev-lab
git checkout -b feature/my-feature
# ... make changes ...
git add .
git commit -m "feat: Add feature"
git push origin feature/my-feature
# ... create PR on GitHub ...

# Database
supabase db push        # Apply migrations
supabase db reset       # Reset local DB (dev only)
supabase db diff        # See schema differences

# Debugging
console.log()           # Classic
debugger;               # Breakpoint
npm run test:ui         # Visual test debugging
npx playwright test --debug  # E2E debugging
```

---

**Welcome to the team! 🚀**

Questions? Ask in Discord #dev-support or email rhoward@hjsservices.us

**© 2025 ODYSSEY-1 AI LLC. All Rights Reserved.**
