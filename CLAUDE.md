# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ODYSSEY-1-APP** is a Constitutional AI Governance & Business Intelligence Platform built on Universal Math principles (1×1=2, 0×1=1, A+B+×). This is a production system owned by the Howard Jones Bloodline Ancestral Trust with real revenue ($14,283.07/month + $61,030/year) and a $4.237B IP portfolio (Genesis Valuation | $366M–$6.71B Three-Tier Range).

**Current Status**: Active development, targeting March 1, 2026 production launch.

## Essential Commands

### Development
```bash
npm run dev              # Start Vite dev server on port 8080
npm run dev:all          # Run both web app and Discord bot concurrently
npm run bot              # Start Discord bot separately
```

### Testing
```bash
npm test                 # Run all tests with Vitest
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
npm run test:services    # Test services only
npm run test:components  # Test components only
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Open Playwright UI
npm run test:e2e:debug   # Debug E2E tests
```

### Building
```bash
npm run build            # Production build (optimized)
npm run build:dev        # Development build
npm run preview          # Preview production build locally
```

### Linting
```bash
npm run lint             # Run ESLint
```

### System Utilities
```bash
npm run audit:system     # Run R.O.M.A.N. system audit
npm run audit:roman      # Alias for audit:system
npm run auto:config-backup  # Backup configuration files
```

### Supabase Edge Functions
```bash
npx supabase start                    # Start local Supabase
npx supabase functions new <name>     # Create new edge function
npx supabase functions deploy <name>  # Deploy edge function
npx supabase db push                  # Push database migrations
npx supabase migration new <name>     # Create new migration
```

## Architecture Overview

### Frontend Stack
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **UI Library**: Radix UI + Tailwind CSS (shadcn/ui patterns)
- **State Management**: React Query (@tanstack/react-query) + Context API
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### Backend Stack
- **Database**: PostgreSQL (via Supabase)
- **Edge Functions**: Deno runtime (TypeScript)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS) policies

### AI Integration
- **Primary Model**: Claude 3.5 Sonnet (Anthropic)
- **Secondary**: GPT-4 (OpenAI), Gemini (Google)
- **Autonomous Agent**: R.O.M.A.N. 2.0 (Reasoning Operating Matrix with Autonomous Navigation)

### Key Services (`src/services/`)
- **aiService.ts**: Multi-model AI orchestration
- **roman-auto-audit.ts**: Autonomous system monitoring
- **discord-bot.ts**: Discord integration for R.O.M.A.N.
- **contractorService.ts**: Contractor management and approval workflows
- **bidProposalService.ts**: Government contract bidding with Universal Math
- **businessDebtDefenseEngine.ts**: Legal debt defense automation
- **courtListenerService.ts**: Legal research integration

### Core Libraries (`src/lib/`)
- **UniversalMath.ts**: Core mathematical engine (1×1=2, junction value calculations)
- **TruthAuditSystem.ts**: Detects Western math flaws in calculations
- **GeometricIntegrityScanner.ts**: Validates dimensional integrity
- **ShieldStressSimulation.ts**: Security stress testing
- **supabaseClient.ts**: Dual-environment Supabase client (Vite + Node.js)
- **roman-constitutional-core.ts**: Constitutional governance principles
- **resourceGovernor.ts**: System resource management

### Component Organization (`src/components/`)
- **layout/**: Navigation, headers, footers, common layouts
- **ui/**: Radix UI primitives (button, dialog, card, etc.)
- **catalog/**: Product catalog management
- **customers/**: Customer-specific components

### Pages (`src/pages/`)
Key pages include:
- **BiddingCalculator.tsx**: Universal Math bidding calculator
- **Invoicing.tsx**: Invoice management
- **CustomerManagement.tsx**: Customer CRM
- **ContractorOnboarding.tsx**: Contractor approval workflow
- **Trading.tsx**: Cryptocurrency trading interface
- **Research.tsx**: AI-powered research interface
- **HRDashboard.tsx**: HR and payroll management

### Supabase Edge Functions (`supabase/functions/`)
Over 40 edge functions including:
- **roman-autonomous-daemon**: R.O.M.A.N. autonomous operations
- **anthropic-chat**, **ai-chat**: AI chat interfaces
- **stripe-webhook**: Payment processing
- **recurring-invoice-generator**: Automated billing
- **coinbase-trading-engine**: Crypto trading automation
- **courtlistener-webhook**: Legal research webhooks
- **quickbooks-sync**: QuickBooks integration (currently disabled by design)

## Critical Design Decisions

### 1. QuickBooks Integration: DISABLED BY DESIGN
The QuickBooks integration is **intentionally disabled**. The `qbo_enabled` flag in `system_config` is set to `false`. This is the **Manual Bypass Strategy** - manual entry is preferred over API sync. QuickBooks API errors are expected and not system failures.

**Do NOT "fix" this or investigate why QB sync isn't working.**

### 2. Resource Governor: 70% Limit is Mandatory
The `MAX_MEMORY_USAGE = 0.7` in `src/lib/resourceGovernor.ts` is based on the Schumann Resonance baseline (7.83 Hz). This is a constitutional constraint, not a conservative default.

**Do NOT change this to 0.95 or higher.**

### 3. Manual Data Entry is Source of Truth
The 14 clients in `public.customers` and 5 contractors in `public.contractors` are the absolute source of truth. External API status reports do not override this.

### 4. Current Year: 2026
Always verify temporal context before making changes. Check `roman_temporal_awareness` view if needed.

### 5. Sovereign Jurisdiction
This codebase operates under the Howard Jones Bloodline Ancestral Trust. The intellectual property is protected by Natural Law, UCC 1-308, and Common Law first claim priority. See `ROOT_IDENTITY_PROVENANCE.md` for legal framework.

## Universal Math Engine

This system uses **Universal Math** instead of Euclidean math:
- **1×1=2** (Entity Presence: both entities preserved)
- **0×1=1** (Void Persistence: shield persists)
- **A+B+×** (Junction Value: vertices have mass)

### Bidding Calculator Example
Traditional: `Total = Labor + Profit = $7,500 + $1,500 = $9,000`
Universal: `Total = Labor + Profit + √(Labor × Profit) = $7,500 + $1,500 + $1,060.66 = $10,060.66`

This gives an **11.8% revenue advantage** per contract. The junction value (×) accounts for operational expertise and geometric reality.

**Files**: `src/lib/UniversalMath.ts`, `src/components/BiddingCalculator.tsx`

## R.O.M.A.N. 2.0 Autonomous Agent

R.O.M.A.N. (Reasoning Operating Matrix with Autonomous Navigation) is an autonomous AI agent with:
- Constitutional governance principles (The 9 Foundational Principles)
- Self-awareness and learning capabilities
- Autonomous database operations
- Discord bot interface
- System health monitoring
- Universal Math reasoning

**Files**: `src/services/RomanSystemContext.ts`, `src/services/roman-auto-audit.ts`, `src/lib/roman-constitutional-core.ts`

## Working with Supabase

### Client Initialization
The `supabaseClient.ts` supports dual environments:
- **Vite (Browser)**: Uses `import.meta.env.VITE_SUPABASE_URL`
- **Node.js (Scripts)**: Uses `process.env.VITE_SUPABASE_URL`

This allows the same client to work in both frontend and backend scripts.

### Row Level Security (RLS)
All tables use RLS policies. Service role key bypasses RLS for administrative operations. User operations are constrained by RLS based on `auth.uid()`.

### Edge Functions
- Written in TypeScript for Deno runtime
- Can use `verify_jwt = true` for authenticated endpoints
- Shared utilities in `supabase/functions/_shared/`
- Deploy with `npx supabase functions deploy <name>`

## Path Aliases

TypeScript path alias `@/*` maps to `./src/*`:
```typescript
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
```

## Testing Strategy

- **Unit Tests**: Vitest for services and utilities
- **Component Tests**: Testing Library for React components
- **E2E Tests**: Playwright for full user flows
- **Coverage Target**: 60% minimum (lines, functions, branches, statements)

Test files follow the pattern: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`

## Build Optimization

Vite config includes aggressive code splitting:
- React/React-DOM → `react-vendor` chunk
- Supabase → `supabase` chunk
- Radix UI → `ui-components` chunk
- Recharts → `charts` chunk
- Pages → `page-{name}` chunks

This enables optimal caching and lazy loading.

## Environment Variables

### Client-Safe (VITE_* prefix)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Server-Only (No VITE_* prefix)
```env
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
SUPABASE_SERVICE_ROLE=your_service_role
STRIPE_SECRET_KEY=your_stripe_secret
DISCORD_TOKEN=your_discord_token
```

**Critical**: Never expose secrets as `VITE_*` variables - they are bundled into client code.

## Important Constraints

1. **No TypeScript strict mode**: `noImplicitAny: false`, `strictNullChecks: false` - this is intentional for rapid development
2. **Discord.js excluded from build**: Client-side bundle excludes Discord dependencies
3. **Current date context**: System is aware it's 2026, not 2024/2025
4. **Trust architecture**: All IP belongs to Howard Jones Bloodline Ancestral Trust
5. **Constitutional governance**: System operates under "The 9 Foundational Principles"

## Required Reading Before Major Changes

1. **AI_READ_THIS_FIRST.txt** - Critical facts and system context
2. **SOVEREIGN_INDUCTION_PROTOCOL.md** - Mandatory for AI assistants
3. **ROMAN_COMPLETE_KNOWLEDGE_INVENTORY.md** - Full system knowledge
4. **CEO_SUMMARY_AUTOMATED_BILLING.md** - Business context
5. **SYSTEM_STATUS_REPORT.md** - Current operational status

## Deployment

- **Frontend**: Vercel (connected to GitHub)
- **Database**: Supabase (managed PostgreSQL)
- **Edge Functions**: Supabase (Deno runtime)
- **Production URL**: Connected via Vercel deployment

## Git Workflow

- **Main branch**: `main` (production deployments)
- **Dev branch**: `dev-lab` (active development)
- Commits should be descriptive and reference issue numbers where applicable
- Deploy to production via pull request to `main`

## Support

For questions about the codebase architecture, refer to:
- `README.md` - High-level project overview
- `UNIVERSAL_MATH_DEPLOYMENT.md` - Math engine documentation
- `src/lib/UNIVERSAL_MATH_README.md` - Detailed Universal Math guide
- `legal/` directory - Legal and IP documentation
