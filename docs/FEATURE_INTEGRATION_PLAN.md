# Feature Integration Plan

**Last Updated:** December 15, 2025  
**Status:** Planning Phase

---

## Overview

This document outlines missing features, required integrations, and button/functionality checks for all newly wired pages.

---

## 1. HR & Workforce Module

### Pages
- `/app/hr-dashboard` - HRDashboard.tsx
- `/app/payroll` - Payroll.tsx
- `/app/time-clock` - TimeClock.tsx
- `/app/schedule` - Schedule.tsx
- `/app/workforce` - WorkforceDashboard.tsx (existing)

### Required Integrations

**HRDashboard ↔ Payroll**
- [ ] Link "Run Payroll" button → `/app/payroll`
- [ ] Share employee data between pages
- [ ] Sync pay periods

**TimeClock ↔ Schedule**
- [ ] Clock-in/out data feeds schedule
- [ ] Schedule displays shift assignments
- [ ] Overtime calculations from time-clock data

**Workforce ↔ HRDashboard**
- [ ] Employee roster sync
- [ ] Performance metrics integration
- [ ] Workforce analytics feed HR dashboard

### Missing Features
- [ ] **Payroll**: Tax calculation, direct deposit setup
- [ ] **TimeClock**: Geolocation tracking, photo verification
- [ ] **Schedule**: Drag-and-drop shift assignment
- [ ] **HRDashboard**: Benefits management, compliance alerts

---

## 2. Business Operations Module

### Pages
- `/app/customers` - CustomerManagement.tsx
- `/app/bidding-calculator` - BiddingCalculator.tsx
- `/app/budget` - Budget.tsx
- `/app/bids` - BidsList.tsx (existing)
- `/app/invoicing` - Invoicing.tsx (existing)
- `/app/checkout` - Checkout.tsx

### Required Integrations

**BiddingCalculator → BidsList**
- [ ] "Save Bid" button creates entry in BidsList
- [ ] Pre-fill customer data from CustomerManagement
- [ ] Link to existing invoices

**CustomerManagement ↔ Invoicing**
- [ ] Customer selector in invoicing pulls from CustomerManagement
- [ ] Invoice history displays per customer
- [ ] Payment status sync

**Budget ↔ Invoicing**
- [ ] Revenue tracking from invoices
- [ ] Expense categorization
- [ ] Budget vs actual comparison

**Checkout ↔ Invoicing**
- [ ] Generate invoice after checkout
- [ ] Payment processing integration
- [ ] Receipt generation

### Missing Features
- [ ] **BiddingCalculator**: Material cost database, labor rate tables
- [ ] **CustomerManagement**: Credit limit tracking, payment terms
- [ ] **Budget**: Forecasting, variance analysis
- [ ] **Checkout**: Stripe integration testing, refund processing

---

## 3. Communication & Support Module

### Pages
- `/app/email-studio` - EmailStudio.tsx
- `/app/help` - Help.tsx
- `/app/appointments` - Appointments.tsx

### Required Integrations

**EmailStudio ↔ CustomerManagement**
- [ ] Customer email templates
- [ ] Bulk email to customer segments
- [ ] Email tracking per customer

**Appointments ↔ Schedule**
- [ ] Appointment slots from employee schedules
- [ ] Calendar sync
- [ ] Reminder emails via EmailStudio

**Help ↔ All Pages**
- [ ] Context-sensitive help buttons
- [ ] Ticket submission system
- [ ] FAQ database

### Missing Features
- [ ] **EmailStudio**: Template library, A/B testing, analytics
- [ ] **Appointments**: Video call integration, payment deposit
- [ ] **Help**: Live chat, knowledge base search, ticketing system

---

## 4. Research & AI Module

### Pages
- `/app/ai-research` - AIResearch.tsx
- `/app/research` - Research.tsx
- `/app/research-notes` - ResearchNotes.tsx
- `/app/admin/ai-intelligence` - AIIntelligenceLiveFeed (existing)

### Required Integrations

**AIResearch → Research**
- [ ] AI-generated research feeds Research page
- [ ] Citation management
- [ ] Export to ResearchNotes

**ResearchNotes ↔ AIIntelligenceLiveFeed**
- [ ] AI suggestions appear in notes
- [ ] Pattern recognition from notes
- [ ] Knowledge graph visualization

**Research → All Modules**
- [ ] Industry research for bidding
- [ ] Competitor analysis
- [ ] Market trends dashboard

### Missing Features
- [ ] **AIResearch**: Academic database integration, PDF parsing
- [ ] **Research**: Collaboration tools, version control
- [ ] **ResearchNotes**: Markdown editor, tagging system, search

---

## 5. Advanced Features Module

### Pages
- `/app/control-panel` - ControlPanel.tsx
- `/app/web3` - Web3.tsx
- `/app/odyssey` - Odyssey.tsx
- `/app/test` - Test.tsx
- `/app/admin` - Admin.tsx (existing)

### Required Integrations

**ControlPanel ↔ Admin**
- [ ] System settings management
- [ ] User permissions
- [ ] Feature flags

**Web3 ↔ Trading**
- [ ] Wallet integration
- [ ] Blockchain transaction history
- [ ] Crypto payment gateway

**Odyssey** (Main Dashboard?)
- [ ] Central hub for all modules
- [ ] Quick actions
- [ ] Recent activity feed

**Test** (Development/QA)
- [ ] Component testing sandbox
- [ ] API testing tools
- [ ] Mock data generation

### Missing Features
- [ ] **ControlPanel**: Audit logs, backup/restore, monitoring
- [ ] **Web3**: MetaMask integration, smart contract interaction
- [ ] **Odyssey**: Widget customization, role-based views
- [ ] **Test**: Automated test runner, coverage reports

---

## 6. Public Pages

### Pages
- `/pricing` - Pricing.tsx
- `/privacy` - Privacy.tsx
- `/terms` - Terms.tsx

### Required Integrations

**Pricing → Subscribe**
- [ ] Plan selection flows to subscription
- [ ] Stripe pricing table sync
- [ ] Feature comparison matrix

**Privacy/Terms → Onboard**
- [ ] Acceptance checkboxes during signup
- [ ] Version tracking
- [ ] User consent logs

### Missing Features
- [ ] **Pricing**: Dynamic pricing, annual/monthly toggle
- [ ] **Privacy**: Cookie consent banner, data export
- [ ] **Terms**: Version history, notification on changes

---

## Button & Navigation Audit Checklist

### Critical Buttons to Test

**Navigation**
- [ ] Sidebar links work for all new routes
- [ ] Breadcrumbs update correctly
- [ ] Back button maintains state

**HR Module**
- [ ] "Run Payroll" (HRDashboard → Payroll)
- [ ] "Clock In/Out" (TimeClock)
- [ ] "View Schedule" (Workforce → Schedule)
- [ ] "Export Report" buttons

**Business Module**
- [ ] "Calculate Bid" (BiddingCalculator)
- [ ] "Create Invoice" (Customers → Invoicing)
- [ ] "Process Payment" (Checkout)
- [ ] "Export Data" buttons

**Communication**
- [ ] "Send Email" (EmailStudio)
- [ ] "Book Appointment" (Appointments)
- [ ] "Submit Ticket" (Help)

**Research**
- [ ] "Run AI Analysis" (AIResearch)
- [ ] "Save Note" (ResearchNotes)
- [ ] "Export Research" buttons

**Forms**
- [ ] All form submissions work
- [ ] Validation shows errors
- [ ] Success messages display
- [ ] Data persists to database

**Modals & Popups**
- [ ] Open/close correctly
- [ ] Overlay blocks background
- [ ] Escape key closes
- [ ] Click outside closes (if intended)

---

## Integration Priority Matrix

| Priority | Module | Estimated Effort | Dependencies |
|----------|--------|------------------|--------------|
| 🔴 **P0** | BiddingCalculator → BidsList | 2 hours | Customer data |
| 🔴 **P0** | CustomerManagement ↔ Invoicing | 4 hours | Stripe setup |
| 🟡 **P1** | Payroll ↔ TimeClock | 6 hours | Tax tables |
| 🟡 **P1** | EmailStudio ↔ Customers | 3 hours | Email templates |
| 🟡 **P1** | Appointments ↔ Schedule | 4 hours | Calendar API |
| 🟢 **P2** | Web3 ↔ Trading | 8 hours | MetaMask |
| 🟢 **P2** | AIResearch → Research | 5 hours | AI API |
| 🟢 **P2** | Budget ↔ Invoicing | 4 hours | Accounting logic |

---

## Next Steps

### Phase 1: Route Testing (Today)
1. Load every page and check for errors
2. Verify navigation works
3. Test back/forward buttons
4. Check mobile responsiveness

### Phase 2: Data Flow (Day 2)
1. Implement P0 integrations
2. Test form submissions
3. Verify database writes
4. Check error handling

### Phase 3: Feature Completion (Days 3-5)
1. Add missing features per priority
2. Implement P1 integrations
3. Build out missing components
4. Write integration tests

### Phase 4: Polish (Days 6-7)
1. UI/UX improvements
2. Loading states
3. Error messages
4. Success notifications

---

## Testing Commands

```bash
# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type check
npm run type-check
```

---

## Notes

- All pages are now routed in `App.tsx`
- ErrorBoundary wraps critical business pages
- Public pages accessible without auth
- Protected routes require authentication

---

**Status Legend:**
- 🔴 P0 = Critical, blocks launch
- 🟡 P1 = Important, needed for full functionality
- 🟢 P2 = Nice to have, can launch without
