# Technical Debt & Maintenance Log
**Document ID**: OD-TECH-DEBT-2025-09-22
**Maintained By**: The Lab Operations
**Status**: ACTIVE

---

## Pending Tasks

### 🔴 HIGH PRIORITY

#### tech-debt: Address pre-existing dependency vulnerabilities (axios, esbuild)
- **Created**: September 22, 2025
- **Priority**: High
- **Category**: Security & Dependencies
- **Description**: Resolve 5 security vulnerabilities detected in dependency audit
  - **High Severity (3)**: axios <=1.11.0 - SSRF, credential leakage, DoS vulnerabilities
  - **Moderate Severity (2)**: esbuild <=0.24.2 - development server security issues
- **Impact**: Development environment security posture
- **Affected Components**: 
  - `github-build → bundlesize` (axios dependency)
  - `vite` (esbuild dependency)
- **Available Fixes**: 
  - `npm audit fix` (non-breaking)
  - `npm audit fix --force` (includes breaking changes)
- **Status**: LOGGED - Awaiting future prioritization
- **Notes**: Does not block current operations, addressed during QA Protocol execution

---

## Completed Tasks

### ✅ RESOLVED

#### fix(budget): Replace SpendingChart with robust component to prevent crashes
- **Completed**: September 22, 2025
- **Commit**: e3a9e12
- **Description**: Replaced chart library dependency with robust table-based component
- **QA Status**: Full protocol executed - PASSED
- **Impact**: Eliminated application crashes in budget overview section

---

*Last Updated: September 22, 2025*
*Next Review: TBD*