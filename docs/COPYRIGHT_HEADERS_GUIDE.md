# ODYSSEY-1 AI LLC - Standard Copyright Headers

## For TypeScript/JavaScript Files (.ts, .tsx, .js, .jsx)

```typescript
/**
 * Copyright © 2025 ODYSSEY-1 AI LLC. All Rights Reserved.
 *
 * This file is part of the ODYSSEY Software System.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 *
 * Patent Pending: US 19/396,082, US 63/913,134
 *
 * ODYSSEY-1 AI LLC
 * 595 Macon Hwy, Apt 35
 * Athens, GA 30606
 * EIN: 41-2718714
 */
```

## For SQL Files (.sql)

```sql
-- ═══════════════════════════════════════════════════════════════
-- Copyright © 2025 ODYSSEY-1 AI LLC. All Rights Reserved.
--
-- This file is part of the ODYSSEY Software System.
-- Unauthorized copying, modification, distribution, or use is prohibited.
--
-- Patent Pending: US 19/396,082, US 63/913,134
-- ═══════════════════════════════════════════════════════════════
```

## For Markdown Files (.md)

```markdown
---
**Copyright © 2025 ODYSSEY-1 AI LLC. All Rights Reserved.**  
Patent Pending: US 19/396,082, US 63/913,134
---
```

## For HTML/TSX UI Components

```tsx
// In footer or about section:
<footer className='text-sm text-gray-600'>
  <p>Copyright © 2025 ODYSSEY-1 AI LLC. All Rights Reserved.</p>
  <p>Patent Pending: US 19/396,082, US 63/913,134</p>
</footer>
```

---

## Files That Need Copyright Header Updates

### HIGH PRIORITY - Remove HJS Services References

These files incorrectly reference HJS SERVICES LLC and should be updated to ODYSSEY-1 AI LLC or made neutral:

#### Source Code Files:

1. `src/services/authService.ts` - Remove "HJS Services LLC" references, update to ODYSSEY-1 AI LLC
2. `src/components/SAMRegistration.tsx` - Remove "HJS SERVICES LLC" hardcoded text
3. `src/pages/Handbook.tsx` - Remove "HJS Services LLC" references
4. `src/pages/Calculator.tsx` - Remove "HJS Services" branding
5. `src/components/UserRoleManager.tsx` - Remove "hjs-internal" role or rename to "odyssey-internal"
6. `src/components/UserManual.tsx` - Remove HJS SERVICES revenue goals, update to ODYSSEY-1
7. `src/services/bidProposalService.ts` - Remove "HJS SERVICES LLC" company profile
8. `src/services/discord-bot.ts` - Remove HJS Services monetization goals

#### Database Migration Files:

9. `supabase/migrations/20250118000002_create_scheduling_system.sql` - Remove HJS Services sample data
10. `supabase/migrations/20241018143200_handbook_sample_content.sql` - Remove HJS Services handbook content
11. `supabase/migrations/20250118000004_test_rls_validation.sql` - Update test email references
12. `supabase/migrations/DEPLOYMENT_GUIDE.md` - Remove HJS Services references

### MEDIUM PRIORITY - Standardize Copyright Headers

These files have inconsistent copyright notices:

#### "Rickey A Howard" → "ODYSSEY-1 AI LLC"

- `src/schemas/RomanCommands.ts`
- `src/pages/CustomerManagement.tsx`
- `src/services/SovereignCoreOrchestrator.ts`
- `src/services/SynchronizationLayer.ts`
- `src/pages/Schedule.tsx`
- `src/services/taxCalculationService.ts`
- `src/services/LogicalHemisphere.ts`
- `src/App.tsx`
- `src/components/WorkforceDashboard.tsx`
- `src/components/UserManual.tsx`
- `src/components/SovereignCoreInterface.tsx`
- `src/components/Admin.tsx`

#### "Believing Self Creations" → "ODYSSEY-1 AI LLC"

- `tests/sovereign-frequency-integration-tests.ts`
- `src/services/calendarService.ts`
- `src/services/samGovService.ts`
- `src/services/sovereignFrequencyLogger.ts`
- `src/services/schedulingService.ts`
- `src/services/marketDataService.ts`
- `src/services/emailService.ts`

#### Database Migrations (Personal Copyright)

- `supabase/migrations/20250118000000_create_bank_accounts.sql`
- `supabase/migrations/20250118000001_create_tax_system.sql`
- `supabase/migrations/20250124000000_create_books_table_and_insert_all_7.sql`

---

## Automated Update Script

### Option 1: Manual Updates (Recommended for Legal Precision)

Review each file individually and update to appropriate copyright notice based on context.

### Option 2: Bulk Find & Replace (Faster but Requires Review)

```powershell
# PowerShell script to update copyright headers (REVIEW EACH CHANGE!)

# Replace "Rickey A Howard" with "ODYSSEY-1 AI LLC"
Get-ChildItem -Path "src" -Recurse -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "© 2025 Rickey A Howard", "Copyright © 2025 ODYSSEY-1 AI LLC"
    Set-Content -Path $_.FullName -Value $content
}

# Replace "Believing Self Creations" with "ODYSSEY-1 AI LLC"
Get-ChildItem -Path "src" -Recurse -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "Believing Self Creations © 2024", "Copyright © 2025 ODYSSEY-1 AI LLC"
    Set-Content -Path $_.FullName -Value $content
}
```

---

## Special Cases

### 1. Honey Pot Logging System

File: `src/services/sovereignFrequencyLogger.ts`

**Keep note:** "40+ Years of Copyrighted Material" refers to song copyrights (third-party), not ODYSSEY ownership.

**Update to:**

```typescript
/**
 * Copyright © 2025 ODYSSEY-1 AI LLC. All Rights Reserved.
 *
 * Sovereign Frequency Logger - "Honey Pot" Security System
 *
 * This module uses copyrighted song titles (owned by their respective copyright holders)
 * as operational identifiers. The methodology and implementation are proprietary to
 * ODYSSEY-1 AI LLC. Song titles are used under fair use for identification purposes only.
 *
 * Patent Pending: US 19/396,082, US 63/913,134
 */
```

### 2. Database Sample Data for HJS Services

Files like `handbook_sample_content.sql` contain HJS Services employee handbook data. **Options:**

A. **Remove entirely** - Clean slate for ODYSSEY-1 AI LLC clients
B. **Make generic** - Replace "HJS Services" with "[Company Name]" placeholders
C. **Create ODYSSEY version** - New sample content for ODYSSEY-1 AI LLC internal use

**Recommendation:** Option B (generic placeholders) for maximum flexibility.

### 3. Email Domain (@hjsservices.us)

The contact email `rhoward@hjsservices.us` is used in:

- USPTO Patent Assignment
- LLC Operating Agreement
- Copyright notices

**This is OK** - You can use an HJS Services email address for personal correspondence without implying ownership. Consider adding a disclaimer:

```
Email: rhoward@hjsservices.us
(Contact email only - No affiliation between ODYSSEY-1 AI LLC and HJS SERVICES LLC)
```

---

## Action Plan

### Phase 1: Critical Separation (TODAY)

1. ✅ Create COPYRIGHT.md (completed)
2. ⏳ Update `src/services/authService.ts` - Remove HJS Services organization logic
3. ⏳ Update `src/pages/Calculator.tsx` - Remove HJS Services branding
4. ⏳ Update `src/components/SAMRegistration.tsx` - Remove hardcoded HJS Services
5. ⏳ Update `src/services/bidProposalService.ts` - Generic or ODYSSEY-1 company profile

### Phase 2: Copyright Standardization (NEXT WEEK)

6. ⏳ Bulk update all "© 2025 Rickey A Howard" → "Copyright © 2025 ODYSSEY-1 AI LLC"
7. ⏳ Bulk update all "Believing Self Creations" → "Copyright © 2025 ODYSSEY-1 AI LLC"
8. ⏳ Add copyright headers to files missing them

### Phase 3: Database Cleanup (WHEN TIME ALLOWS)

9. ⏳ Update database migrations to remove HJS Services sample data
10. ⏳ Create generic sample data or ODYSSEY-1 specific examples
11. ⏳ Update handbook content to be client-agnostic

---

## Legal Confirmation

After updates are complete:

1. **Git Commit Message:**

   ```
   Legal: Transfer copyright from personal/Believing Self Creations to ODYSSEY-1 AI LLC

   - Update all copyright headers to reflect ODYSSEY-1 AI LLC ownership
   - Remove HJS SERVICES LLC references (separate entity)
   - Add Patent Pending notices (US 19/396,082, US 63/913,134)
   - Create comprehensive COPYRIGHT.md

   Effective Date: November 21, 2025
   Authority: LLC Operating Agreement Article IV, USPTO Patent Assignment
   ```

2. **Version Tag:**

   ```
   git tag -a v2.0.0-odyssey-ip -m "ODYSSEY-1 AI LLC IP transfer complete"
   ```

3. **Update package.json:**
   ```json
   {
     "name": "@odyssey-1-ai/odyssey-platform",
     "author": "ODYSSEY-1 AI LLC",
     "license": "PROPRIETARY",
     "copyright": "Copyright © 2025 ODYSSEY-1 AI LLC. All Rights Reserved."
   }
   ```

---

**END OF COPYRIGHT HEADER GUIDE**

**Copyright © 2025 ODYSSEY-1 AI LLC. All Rights Reserved.**
