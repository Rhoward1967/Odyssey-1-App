# ODYSSEY-1 API Documentation

**Version:** 2.0.0  
**Last Updated:** December 15, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Supabase Edge Functions](#supabase-edge-functions)
4. [Database RPC Functions](#database-rpc-functions)
5. [Frontend Service APIs](#frontend-service-apis)
6. [R.O.M.A.N. Integration](#roman-integration)
7. [Webhooks](#webhooks)
8. [Error Handling](#error-handling)

---

## Overview

ODYSSEY-1 uses a hybrid architecture:
- **Frontend:** React + TypeScript (Vite)
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI Services:** Anthropic Claude, OpenAI, Google Gemini
- **Payment Processing:** Stripe
- **Real-time:** Supabase Realtime (WebSocket)
- **Autonomous AI:** R.O.M.A.N. (Constitutional AI Governance)

**Base URLs:**
- Frontend: `http://localhost:8080` (dev), `https://odyssey-app.com` (prod)
- Supabase API: `https://tvsxloejfsrdganemsmg.supabase.co`
- Edge Functions: `https://tvsxloejfsrdganemsmg.supabase.co/functions/v1`

---

## Authentication

### Magic Link Authentication

ODYSSEY-1 uses passwordless authentication via Supabase Auth.

#### Request Magic Link
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'http://localhost:8080/auth/callback'
  }
});
```

#### Handle Auth Callback
```typescript
// Route: /auth/callback
const { data: { session }, error } = await supabase.auth.getSession();
```

#### Get Current User
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
```

#### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Authorization Headers

All authenticated requests require the user's JWT token:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const headers = {
  'Authorization': `Bearer ${session?.access_token}`,
  'Content-Type': 'application/json'
};
```

### Row Level Security (RLS)

All database tables enforce RLS policies:
- Users can only access their own data
- Organization members can access shared organization data
- Admin users have elevated permissions via `is_admin` flag

---

## Supabase Edge Functions

Edge Functions run on Deno runtime at the edge (globally distributed).

### Base URL
```
https://tvsxloejfsrdganemsmg.supabase.co/functions/v1
```

### Authentication
All Edge Functions require the `Authorization` header with a valid Supabase JWT:

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/function-name`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

---

### 1. AI Chat (`/ai-chat`)

Multi-provider AI chat endpoint supporting Claude, OpenAI, and Gemini.

**Endpoint:** `POST /functions/v1/ai-chat`

**Request Body:**
```typescript
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "How are you?" }
  ],
  "provider": "anthropic" | "openai" | "gemini"
}
```

**Response:**
```typescript
{
  "response": "I'm doing well, thank you for asking!"
}
```

**Error Response:**
```typescript
{
  "error": "Error message"
}
```

---

### 2. Trade Orchestrator (`/trade-orchestrator`)

Manages trading operations including live P&L, position tracking, and trade execution.

**Endpoint:** `POST /functions/v1/trade-orchestrator`

**Actions:**

#### Get Live P&L
```typescript
{
  "action": "GET_LIVE_P_AND_L",
  "payload": {}
}
```

**Response:**
```typescript
{
  "positions": [
    {
      "symbol": "AAPL",
      "shares": 100,
      "purchase_price": 150.00,
      "current_price": 155.00,
      "unrealized_pnl": 500.00
    }
  ],
  "total_pnl": 500.00
}
```

#### Execute Trade
```typescript
{
  "action": "EXECUTE_TRADE",
  "payload": {
    "symbol": "AAPL",
    "shares": 100,
    "action": "BUY" | "SELL",
    "price": 155.00
  }
}
```

---

### 3. Roman Processor (`/roman-processor`)

R.O.M.A.N.'s command processor for autonomous operations validated against Constitutional AI principles.

**Endpoint:** `POST /functions/v1/roman-processor`

**Request Body:**
```typescript
{
  "userIntent": "Generate system status report",
  "userId": "user-uuid",
  "organizationId": 123,
  "correlation_id": "unique-request-id"
}
```

**Response (Success):**
```typescript
{
  "success": true,
  "result": {
    "timestamp": "2025-12-15T12:00:00Z",
    "status": "SOVEREIGN_OPERATIONAL",
    "principles_active": 9,
    "ai_agents": 3,
    "security_level": "MAXIMUM"
  },
  "command": {
    "intent": "system_status",
    "priority": "high",
    "timestamp": "2025-12-15T12:00:00Z"
  },
  "validation": {
    "approved": true,
    "checks_passed": ["inhabitance", "harmony", "coherence", "integrity"]
  }
}
```

**Response (Principle Violation):**
```typescript
{
  "success": false,
  "message": "Action violates Law of Inhabitance - risk to user safety",
  "principle_violation": "INHABITANCE"
}
```

---

### 4. Cost Optimization Engine (`/cost-optimization-engine`)

Monitors AI API usage and provides cost optimization recommendations.

**Endpoint:** `POST /functions/v1/cost-optimization-engine`

**Request Body:**
```typescript
{
  "action": "analyze_costs",
  "timeframe": "30d"
}
```

**Response:**
```typescript
{
  "providers": [
    {
      "name": "OpenAI",
      "total_cost": 125.50,
      "requests": 1500,
      "avg_cost_per_request": 0.08
    },
    {
      "name": "Anthropic",
      "total_cost": 98.20,
      "requests": 800,
      "avg_cost_per_request": 0.12
    }
  ],
  "recommendations": [
    "Switch image generation to Gemini (30% cost savings)",
    "Use Claude for long-context tasks (better value)"
  ],
  "total_monthly_cost": 223.70,
  "projected_savings": 67.11
}
```

---

### 5. Discord Bot (R.O.M.A.N.) (`/discord-bot-OLD`)

**Note:** This is the legacy Discord bot. Current implementation uses Node.js service (`src/services/discord-bot.ts`).

Handles Discord interactions and R.O.M.A.N. commands.

**Endpoint:** `POST /functions/v1/discord-bot-OLD`

**Webhook Integration:** Receives Discord interaction webhooks.

---

### 6. Stripe Integration

#### Create Checkout Session (`/create-checkout-session`)
```typescript
{
  "priceId": "price_123",
  "customerId": "cus_123",
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel"
}
```

#### Create Portal Session (`/create-portal-session`)
```typescript
{
  "customerId": "cus_123",
  "returnUrl": "https://app.com/billing"
}
```

#### Stripe Webhook (`/stripe-webhook`)
Handles Stripe events (subscription created, updated, deleted, payment succeeded/failed).

---

### 7. Auto Assign User (`/auto-assign-user`)

Automatically assigns admin role to approved HJS Services LLC emails.

**Endpoint:** `POST /functions/v1/auto-assign-user`

**Request Body:**
```typescript
{
  "userId": "user-uuid",
  "email": "rhoward@hjsservices.us"
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "Admin access granted",
  "role": "admin"
}
```

---

## Database RPC Functions

RPC (Remote Procedure Call) functions are SQL functions called directly from the frontend.

### Call RPC Function

```typescript
const { data, error } = await supabase.rpc('function_name', {
  param1: value1,
  param2: value2
});
```

---

### 1. `run_payroll_for_period`

Processes payroll for a given period.

**Parameters:**
```typescript
{
  org_id: number,
  start_date: string, // ISO 8601 format
  end_date: string
}
```

**Example:**
```typescript
const { data, error } = await supabase.rpc('run_payroll_for_period', {
  org_id: 1,
  start_date: '2025-12-01',
  end_date: '2025-12-15'
});
```

**Returns:**
```typescript
{
  success: boolean,
  employees_processed: number,
  total_amount: number,
  paystubs_created: number
}
```

---

### 2. `get_optimal_bid_margin`

Calculates optimal bid margin based on historical data and market conditions.

**Parameters:**
```typescript
{
  service_type: string,
  region: string,
  complexity: 'low' | 'medium' | 'high'
}
```

**Returns:**
```typescript
{
  recommended_margin: number, // percentage (e.g., 0.25 = 25%)
  confidence_score: number, // 0-1
  similar_bids_count: number
}
```

---

### 3. `search_customers`

Full-text search across customer records.

**Parameters:**
```typescript
{
  search_query: string,
  organization_id: number
}
```

**Returns:**
```typescript
[
  {
    id: number,
    name: string,
    email: string,
    phone: string,
    address: string,
    total_revenue: number
  }
]
```

---

### 4. `get_employee_time_summary`

Gets time tracking summary for an employee.

**Parameters:**
```typescript
{
  employee_id: number,
  start_date: string,
  end_date: string
}
```

**Returns:**
```typescript
{
  total_hours: number,
  regular_hours: number,
  overtime_hours: number,
  days_worked: number,
  avg_hours_per_day: number
}
```

---

## Frontend Service APIs

Frontend services in `src/services/` provide abstracted interfaces to backend APIs.

---

### 1. Auth Service (`authService.ts`)

```typescript
import { authService } from '@/services/authService';

// Sign in with magic link
await authService.signIn('user@example.com');

// Sign out
await authService.signOut();

// Get current user
const user = await authService.getCurrentUser();

// Check if user is admin
const isAdmin = await authService.isAdmin();
```

---

### 2. Bid Proposal Service (`bidProposalService.ts`)

```typescript
import { bidProposalService } from '@/services/bidProposalService';

// Calculate bid
const bid = await bidProposalService.calculateBid({
  serviceType: 'consulting',
  hours: 40,
  hourlyRate: 150,
  expenses: 500,
  margin: 0.25
});

// Create bid proposal
const proposal = await bidProposalService.createProposal({
  customerId: 123,
  title: 'Website Redesign',
  items: [...],
  total: 12500
});

// Get optimal margin
const margin = await bidProposalService.getOptimalMargin({
  serviceType: 'consulting',
  complexity: 'high'
});
```

---

### 3. Calendar Service (`calendarService.ts`)

```typescript
import { calendarService } from '@/services/calendarService';

// Create appointment
const appointment = await calendarService.createAppointment({
  title: 'Client Meeting',
  startTime: '2025-12-20T10:00:00Z',
  endTime: '2025-12-20T11:00:00Z',
  customerId: 123
});

// Get appointments for date range
const appointments = await calendarService.getAppointments({
  startDate: '2025-12-01',
  endDate: '2025-12-31'
});

// Update appointment
await calendarService.updateAppointment(appointmentId, {
  startTime: '2025-12-20T14:00:00Z'
});
```

---

### 4. Email Service (`emailService.ts`)

```typescript
import { emailService } from '@/services/emailService';

// Send email via Resend
await emailService.sendEmail({
  to: 'client@example.com',
  from: 'noreply@odyssey.com',
  subject: 'Your Invoice',
  html: '<h1>Invoice #1234</h1>',
  replyTo: 'support@odyssey.com'
});

// Send invoice email
await emailService.sendInvoiceEmail({
  invoiceId: 1234,
  customerEmail: 'client@example.com',
  amount: 12500,
  dueDate: '2025-12-31'
});
```

---

### 5. AI Service (`aiService.ts`)

```typescript
import { aiService } from '@/services/aiService';

// Chat with AI (multi-provider)
const response = await aiService.chat({
  messages: [
    { role: 'user', content: 'Analyze this contract' }
  ],
  provider: 'anthropic', // or 'openai', 'gemini'
  model: 'claude-3-5-sonnet-20241022'
});

// Generate document
const document = await aiService.generateDocument({
  type: 'proposal',
  context: {
    clientName: 'Acme Corp',
    services: ['consulting', 'development']
  }
});
```

---

### 6. Document Review Service (`documentReviewService.ts`)

```typescript
import { documentReviewService } from '@/services/documentReviewService';

// Analyze document
const analysis = await documentReviewService.analyzeDocument({
  documentId: 123,
  analysisType: 'contract_review'
});

// Extract data from document
const data = await documentReviewService.extractData({
  documentId: 123,
  schema: {
    fields: ['date', 'amount', 'parties']
  }
});
```

---

## R.O.M.A.N. Integration

R.O.M.A.N. (Recursive Optimization & Machine Augmented Neural-network) is the autonomous AI governance system.

### Constitutional Core

All R.O.M.A.N. actions are validated against Sacred Geometry principles:

```typescript
import { isActionCompliant } from '@/lib/roman-constitutional-core';

const actionData = {
  intent: 'approve_payment',
  risk_to_life: 0,
  brute_force: false,
  target_frequency: 7.83, // Schumann Resonance
  entropy_increase: 0,
  geometric_ratio: 1.618, // Golden Ratio (Phi)
  system_entropy_level: 0.05
};

const result = isActionCompliant(actionData, 0.05);

if (!result.compliant) {
  console.error('Violation:', result.violations);
  console.error('Axiom:', result.axiom);
}
```

### R.O.M.A.N. Event Logging

All R.O.M.A.N. activities are logged to `ops.roman_events`:

```typescript
await supabase.from('ops_roman_events').insert({
  event_type: 'approval',
  severity: 'info',
  message: 'Payment approved by R.O.M.A.N.',
  metadata: {
    amount: 1000,
    recipient: 'vendor@example.com',
    constitutional_validation: 'passed'
  }
});
```

### Real-time R.O.M.A.N. Events

Subscribe to R.O.M.A.N. events via Supabase Realtime:

```typescript
const channel = supabase
  .channel('roman:events')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'ops',
    table: 'roman_events'
  }, (payload) => {
    console.log('R.O.M.A.N. event:', payload.new);
  })
  .subscribe();
```

---

## Webhooks

### Stripe Webhook

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Events Handled:**
- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

**Webhook Secret:** Configured in Stripe Dashboard

**Verification:**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sig = request.headers.get('stripe-signature');

const event = stripe.webhooks.constructEvent(
  requestBody,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

### Discord Webhook (R.O.M.A.N. Notifications)

**Endpoint:** Configured in Discord Server Settings → Integrations → Webhooks

**Usage:**
```typescript
await fetch(DISCORD_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '🤖 R.O.M.A.N. Status: System operational',
    embeds: [{
      title: 'Deployment Complete',
      description: 'Staging environment updated',
      color: 0x00ff00,
      timestamp: new Date().toISOString()
    }]
  })
});
```

---

## Error Handling

### Standard Error Response

```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error context
  }
}
```

### HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (invalid input)
- **401** - Unauthorized (missing/invalid auth token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **500** - Internal Server Error
- **503** - Service Unavailable

### Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) throw error;
  
  return data;
} catch (error) {
  console.error('Operation failed:', error);
  
  // Log to R.O.M.A.N.
  await supabase.from('system_logs').insert({
    severity: 'error',
    source: 'api_call',
    message: error.message,
    metadata: { stack: error.stack }
  });
  
  throw new Error('Operation failed. R.O.M.A.N. has been notified.');
}
```

### React Error Boundary

Global error boundary catches React errors and logs to R.O.M.A.N.:

```typescript
import ErrorBoundary from '@/lib/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## Rate Limiting

### Supabase API

- **Anon Key:** 100 requests/second
- **Service Role Key:** 1000 requests/second (R.O.M.A.N. only)

### Edge Functions

- **Default:** 50 requests/second per IP
- **Authenticated:** 200 requests/second per user

### AI API Providers

- **OpenAI:** Rate limits vary by tier (see OpenAI docs)
- **Anthropic:** 50 requests/minute (standard tier)
- **Gemini:** 60 requests/minute (free tier)

---

## Testing

### Unit Tests
```bash
npm test                 # Run all unit tests
npm run test:coverage    # Run with coverage
npm run test:watch       # Watch mode
```

### E2E Tests
```bash
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # Interactive mode
npm run test:e2e:debug   # Debug mode
```

### API Testing with curl

```bash
# Test Edge Function
curl -X POST \
  https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"provider":"anthropic"}'

# Test RPC Function
curl -X POST \
  https://tvsxloejfsrdganemsmg.supabase.co/rest/v1/rpc/get_optimal_bid_margin \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_type":"consulting","region":"US","complexity":"high"}'
```

---

## Environment Variables

### Required Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://tvsxloejfsrdganemsmg.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Backend only

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...  # Backend only
STRIPE_WEBHOOK_SECRET=whsec_...  # Backend only

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...

# Discord (R.O.M.A.N.)
DISCORD_BOT_TOKEN=...
DISCORD_CHANNEL_ID=...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email
RESEND_API_KEY=re_...

# Feature Flags
VITE_ENABLE_TRADING=true
VITE_ENABLE_AI_RESEARCH=true
```

---

## Support & Resources

- **Repository:** https://github.com/Rhoward1967/Odyssey-1-App
- **Supabase Dashboard:** https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Documentation:** `/docs` directory
- **Issue Tracker:** GitHub Issues

---

## Changelog

### Version 2.0.0 (December 15, 2025)
- ✅ Constitutional AI integration (Sacred Geometry)
- ✅ 46 unit tests + 7 E2E tests
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Database security hardening (RLS + search_path fixes)
- ✅ Multi-provider AI chat
- ✅ Comprehensive error boundaries

### Version 1.0.0 (November 2024)
- Initial production release
- Core platform features (bidding, invoicing, payroll)
- Stripe payment integration
- Discord bot (R.O.M.A.N. v1)

---

**© 2025 ODYSSEY-1 AI LLC. All Rights Reserved.**  
**Property of Rickey A Howard**
