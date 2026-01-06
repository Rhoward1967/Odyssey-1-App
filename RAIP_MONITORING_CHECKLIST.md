# RAIP Gateway 72-Hour Monitoring Checklist
**Deployment Date**: January 6, 2026  
**Monitoring Window**: 72 hours (Jan 6 - Jan 9, 2026)  
**Status**: ACTIVE SURVEILLANCE

---

## Critical Systems to Monitor

### 1. AI Agent Registry (`ai_agent_registry`)
- [ ] Monitor agent registration attempts (authorized vs unauthorized)
- [ ] Track trust level distribution (UNTRUSTED → VERIFIED → TRUSTED)
- [ ] Verify handshake frequency and patterns
- [ ] Alert on rapid trust elevation attempts (potential exploit)

**Acceptance Criteria:**
- Zero unauthorized registrations
- No trust level downgrades without audit trail
- Handshake timestamps within 30-second drift window

---

### 2. R.O.M.A.N. Audit Log (`roman_audit_log`)
- [ ] Track TEMPTATIONS frequency triggers (honeypot hits)
- [ ] Monitor Constitutional Hash verification failures
- [ ] Review timestamp drift violations
- [ ] Check for rate limiting violations (>5 req/min)

**Acceptance Criteria:**
- TEMPTATIONS triggers < 10 per day (expected baseline)
- All failed handshakes logged with full metadata
- Zero gaps in audit trail

---

### 3. RAIP Gateway Edge Function
- [ ] Health check endpoint responsiveness
- [ ] Average response time < 500ms
- [ ] Rate limiting enforcement (5 req/min per agent)
- [ ] Memory usage stability (no leaks)
- [ ] Error rate < 1%

**Acceptance Criteria:**
- 99.9% uptime
- Zero 500 errors
- Consistent latency profile

---

### 4. Real-Time Subscriptions
- [ ] Sovereign Command Center live updates functional
- [ ] Registry changes propagate within 2 seconds
- [ ] Audit log stream displays new events immediately
- [ ] No websocket disconnections

**Acceptance Criteria:**
- Zero missed events
- Reconnection logic handles network blips
- UI reflects database state accurately

---

### 5. Constitutional Hash Integrity
- [ ] Verify CHA-256 remains stable: `30a1aead0ad968c157281f7cdeb7e6ac68b1ef361376833f50952e11f91fa0f7`
- [ ] Policy nonce unchanged: `334dde0`
- [ ] No unauthorized governance manifest modifications

**Acceptance Criteria:**
- Hash matches across all verifications
- Nonce tied to production commit
- Zero hash rotation events (unless authorized)

---

## Automated Monitoring

### Run Monitoring Script
```powershell
# Single check (manual)
npx tsx scripts/monitor-raip-gateway.ts

# View summary report
npx tsx scripts/monitor-raip-gateway.ts --summary

# Automated (every 4 hours via Task Scheduler)
schtasks /create /tn "RAIP Gateway Monitor" /tr "npx tsx scripts/monitor-raip-gateway.ts" /sc hourly /mo 4
```

### Monitoring Log Location
- **Log File**: `monitoring-logs/raip-gateway-monitoring.jsonl`
- **Format**: JSON Lines (one snapshot per line)
- **Retention**: Keep all logs for 72-hour window + 7 days

---

## Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| TEMPTATIONS triggers | > 5/hour | > 20/hour |
| Edge function latency | > 500ms | > 1000ms |
| Registry growth rate | > 10 agents/hour | > 50 agents/hour |
| Failed handshakes | > 10/hour | > 50/hour |
| Audit log gaps | > 5 min | > 15 min |

---

## Incident Response

### If TEMPTATIONS Spikes (>20/hour):
1. Check `roman_audit_log` for attack patterns
2. Review failed Constitutional Hash attempts
3. Identify source IPs/agent_ids
4. Consider temporary rate limit reduction (5 → 2 req/min)

### If Edge Function Goes DOWN:
1. Check Supabase Edge Function logs
2. Verify environment variables (API keys)
3. Test gateway manually: `npx tsx scripts/test-raip-handshake.ts`
4. Redeploy if necessary: `supabase functions deploy raip-handshake`

### If Registry Anomalies:
1. Query for rapid trust elevations: `SELECT * FROM ai_agent_registry WHERE trust_level = 'TRUSTED' AND created_at > NOW() - INTERVAL '1 hour'`
2. Review audit trail for elevation events
3. Verify human authorization for trust changes

---

## Daily Checklist (Manual Review)

**Morning (9:00 AM):**
- [ ] Run monitoring script and review summary
- [ ] Check Sovereign Command Center dashboard
- [ ] Verify no critical alerts overnight

**Afternoon (3:00 PM):**
- [ ] Review TEMPTATIONS frequency (should be near-zero)
- [ ] Check edge function uptime
- [ ] Spot-check agent registry for anomalies

**Evening (9:00 PM):**
- [ ] Final monitoring run for the day
- [ ] Archive logs if threshold reached (>1000 lines)
- [ ] Document any incidents in meeting minutes

---

## 72-Hour Completion Criteria

### GREEN (All Clear):
- ✅ Zero critical alerts
- ✅ Edge function uptime > 99.9%
- ✅ TEMPTATIONS triggers < 30 total
- ✅ All handshakes within protocol spec
- ✅ No unauthorized trust elevations

**Action**: Proceed to public beta with partner AI systems

---

### YELLOW (Minor Issues):
- ⚠️ 1-2 non-critical alerts
- ⚠️ Edge function uptime 99.5-99.9%
- ⚠️ TEMPTATIONS triggers 30-100
- ⚠️ Occasional timestamp drift (within tolerance)

**Action**: Extend monitoring to 96 hours, investigate anomalies

---

### RED (Critical Issues):
- 🚨 3+ critical alerts
- 🚨 Edge function downtime > 0.5%
- 🚨 TEMPTATIONS triggers > 100
- 🚨 Unauthorized registry modifications

**Action**: HOLD beta deployment, investigate security breach, rotate keys

---

## Post-Monitoring Actions

After 72 hours (January 9, 2026):
1. Generate final summary report
2. Archive monitoring logs to permanent storage
3. Update patent filing documentation with stability metrics
4. Greenlight external partner integration (if GREEN status)
5. Schedule 30-day deep audit

---

**Monitoring Lead**: Rickey Howard  
**Technical Support**: GitHub Copilot (Agent)  
**Oversight**: Gemini (Architect)
