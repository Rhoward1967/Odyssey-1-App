# CourtListener Webhook Setup Guide

Your webhook endpoint is now ready to receive real-time legal alerts.

## Webhook URL

```
https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/courtlistener-webhook
```

**Security Token (append to URL):**
```
?token=47dc118c25d629f21f2c2797664b28f4105614da
```

**Full Webhook URL to add to CourtListener:**
```
https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/courtlistener-webhook?token=47dc118c25d629f21f2c2797664b28f4105614da
```

---

## Step-by-Step: Add Webhook to CourtListener

### 1. Go to CourtListener Webhooks Page
https://www.courtlistener.com/api/webhooks/

### 2. Click "Add Webhook"

### 3. Fill in the form:

**Endpoint URL:**
```
https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/courtlistener-webhook?token=47dc118c25d629f21f2c2797664b28f4105614da
```

**Event Type:** `search.Alert`  
(This will notify you when new cases match your saved searches)

**Version:** `v2` (select v2 from dropdown)

**Enabled:** ✅ Check this box

### 4. Save Webhook

---

## Create Search Alerts

After adding the webhook, create saved searches that will trigger alerts:

### Go to: https://www.courtlistener.com/

**Search 1: UCC-1 Georgia Cases**
- Query: `UCC-1 financing statement secured creditor`
- Jurisdiction: Georgia (select `ga`, `gactapp`, `gamd`, `gand`, `gasd`)
- Click "Create Alert" → Name: "UCC-1 Georgia"

**Search 2: Trust Protection Cases**
- Query: `irrevocable trust creditor protection`
- Jurisdiction: Georgia
- Click "Create Alert" → Name: "Trust Creditor Protection"

**Search 3: Entity Monitoring**
- Query: `"Howard Jones Family Ancestral Trust"`
- Jurisdiction: All federal courts
- Click "Create Alert" → Name: "Trust Name Monitor"

**Search 4: HJS Services LLC**
- Query: `"HJS Services LLC"`
- Jurisdiction: All federal + Georgia
- Click "Create Alert" → Name: "HJS Services Monitor"

**Search 5: Odyssey-1 AI LLC**
- Query: `"Odyssey-1 AI LLC" OR "Odyssey-1 LLC"`
- Jurisdiction: All federal + Georgia
- Click "Create Alert" → Name: "Odyssey-1 Monitor"

---

## What Happens When a Case is Found

1. **CourtListener** finds a new case matching your alert
2. **Webhook fires** → sends data to your Supabase function
3. **Odyssey-1** receives the webhook and:
   - Stores case in `legal_precedents` table
   - Logs event in `legal_webhook_log`
   - Checks for critical keywords (Howard Jones, HJS Services, Odyssey-1, UCC-1)
   - If critical match: Sends urgent email + Discord alert
4. **You get notified** within minutes of filing

---

## Rapid Response Playbook (15-Minute Drill)

When an alert hits, follow this sequence:

1. **Confirm the entity match**
  - Is it *Howard Jones Family Ancestral Trust*, *HJS Services LLC*, *Odyssey-1 AI LLC*, or a UCC-1 keyword?
2. **Open the case link**
  - Check court, filing date, and docket number.
3. **Classify the alert**
  - *Informational* (general precedent)
  - *Watch* (entity mention, no action yet)
  - *Urgent* (direct claim against assets/entities)
4. **Capture facts**
  - Save the docket number, court, and parties in your notes.
5. **Decide next action**
  - *Watch*: Set reminder to review weekly
  - *Urgent*: Prepare response path (counsel, filings, documentation)

---

## Database Setup (Run in Supabase SQL Editor)

```sql
-- Webhook event log
CREATE TABLE IF NOT EXISTS legal_webhook_log (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE legal_webhook_log ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert
CREATE POLICY "Allow service role to insert webhook logs"
ON legal_webhook_log FOR INSERT
TO service_role
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_webhook_log_received_at ON legal_webhook_log(received_at DESC);
CREATE INDEX idx_webhook_log_event_type ON legal_webhook_log(event_type);
```

---

## Testing the Webhook

### Method 1: Manual Test (from CourtListener dashboard)
1. Go to https://www.courtlistener.com/api/webhooks/
2. Find your webhook
3. Click "Test" button
4. Check Supabase logs: `supabase functions logs courtlistener-webhook`

### Method 2: curl Test
```bash
curl -X POST https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/courtlistener-webhook?token=47dc118c25d629f21f2c2797664b28f4105614da \
  -H "Content-Type: application/json" \
  -d '{
    "event": "search.Alert",
    "payload": {
      "results": [
        {
          "id": 999999,
          "caseName": "TEST CASE - Howard Jones Trust v. Example",
          "court": "gactapp",
          "dateFiled": "2026-02-04",
          "docketNumber": "TEST-123",
          "snippet": "This is a test webhook for UCC-1 filing monitoring"
        }
      ]
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Webhook processed",
  "casesStored": 1
}
```

---

## Automation: Weekly Legal Scan (Task)

Run the monitor with one click from VS Code:

- Task: **CourtListener: Legal Research Monitor**
- Command: `npx dotenv -e .env -- node scripts/legal-research-monitor.mjs`

You can also schedule this task in Windows Task Scheduler for weekly scans.

---

## Optional: Discord Integration

For instant mobile notifications, add a Discord webhook:

### 1. Create Discord Server (if you don't have one)
### 2. Create Webhook
- Server Settings → Integrations → Webhooks
- Create Webhook → Name it "Legal Alerts"
- Copy Webhook URL

### 3. Add to Supabase .env
```bash
DISCORD_LEGAL_ALERTS_WEBHOOK=https://discord.com/api/webhooks/your-webhook-url-here
```

### 4. Deploy function again
```bash
supabase functions deploy courtlistener-webhook
```

Now critical legal alerts will appear in Discord immediately.

---

## Deployment

Deploy the webhook function to Supabase:

```bash
cd C:\Users\gener\Odyssey-1-App
supabase functions deploy courtlistener-webhook
```

---

## Cost

**CourtListener Pro Tier:** $10-$25/month  
(Required for webhook functionality)

**Benefits:**
- Real-time alerts (instant notifications)
- Unlimited saved searches
- Webhook support
- Priority API access
- Support the Free Law Project non-profit

**Upgrade at:** https://donate.free.law/forms/membership

---

## Monitoring

### Check webhook logs
```bash
supabase functions logs courtlistener-webhook --tail
```

### Query stored cases
```sql
SELECT * FROM legal_precedents 
WHERE 'webhook-alert' = ANY(tags)
ORDER BY added_at DESC
LIMIT 10;
```

### Check webhook event log
```sql
SELECT * FROM legal_webhook_log
ORDER BY received_at DESC
LIMIT 10;
```

---

## Webhook URL Summary

✅ **Production Webhook:**
```
https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/courtlistener-webhook?token=47dc118c25d629f21f2c2797664b28f4105614da
```

✅ **Event Type:** `search.Alert`

✅ **Version:** `v2`

✅ **Enabled:** Yes

---

**Next Steps:**
1. Add webhook URL to CourtListener
2. Create 5 saved search alerts
3. Upgrade to Pro tier ($10-$25/month)
4. Test webhook with curl command
5. Wait for first real case alert

You'll now be notified within minutes of any legal filing affecting your Trust or business entities.
