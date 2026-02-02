# 🚀 CONTRACTOR EMAIL QUICKSTART

**Mission:** Send contractor invitations with automated Resend delivery

---

## 🎯 SEND CONTRACTOR INVITE (3 Steps)

### From ContractorManager Dashboard

1. **Click "SEND INVITE" button** (top right)
2. **Fill in contractor details:**
   - Full Name (e.g., "John Smith")
   - Email Address (e.g., "john@example.com")
   - Optional: Flat Rate (defaults to $262.00)
3. **Click "Generate & Send"**

**What Happens Automatically:**
- ✅ Unique UUID token generated
- ✅ Contractor record created (status: pending)
- ✅ Invitation email sent via Resend
- ✅ Email ID tracked in database
- ✅ invite_sent_at timestamp recorded

**Contractor Receives:**
- 📧 Email: "Action Required: Odyssey-1 AI LLC Contractor Onboarding"
- 🔗 Secure portal link: `https://odyssey-1-app.vercel.app/onboarding/contractor/{token}`
- 📋 Requirements: Tax ID, banking info, check number, voided check, signature
- ⏰ 7-day expiration warning

---

## 📥 CONTRACTOR SUBMITS W-9

### They Complete:
1. ✅ Select contractor type (Individual/Business)
2. ✅ Enter business name (if applicable)
3. ✅ Provide legal name for W-9
4. ✅ Enter contact info (email, phone)
5. ✅ **Tax ID** (SSN or EIN format: XX-XXXXXXX or XXX-XX-XXXX)
6. ✅ **Triple-Lock Banking:**
   - Routing number (9 digits)
   - Account number (match confirmation)
   - Check number (from voided check)
7. ✅ Upload voided check image (PDF/image, <5MB)
8. ✅ Digital signature (must match legal name exactly)

**Validation:**
- Tax ID format enforced
- Routing number = 9 digits
- Account numbers must match
- Signature must match legal name
- Voided check required

**On Submit:**
- Status → `submitted`
- Moves to Compliance tab → Pending Approvals queue

---

## ✅ ADMIN APPROVES/REJECTS

### Compliance Tab → Pending Approvals

**For Each Submission, You See:**
- 👤 Contractor info (name, type, email, phone, business name)
- 🏦 Triple-Lock banking (routing, account last 4, check number)
- ✍️ Digital signature verification (✅ green = match, ❌ red = mismatch)
- 🖼️ **VIEW CHECK** button (opens voided check image)

### Approve Flow:
1. **Click "VIEW CHECK"** → Verify banking info matches uploaded check
2. **Click "APPROVE"** → Confirm dialog
3. **Email auto-sent:** "✅ Success: Your Odyssey-1 Direct Deposit is Active"
4. **Database updates:**
   - Status → `approved`
   - approval_email_sent_at → current timestamp
   - approval_email_id → Resend email ID
   - approved_by → your admin ID
   - approved_at → current timestamp

### Reject Flow:
1. **Click "REJECT"** → Rejection modal opens
2. **Enter custom reason** (e.g., "Check image is blurry, please upload clearer photo")
3. **Click "Confirm Rejection"**
4. **Email auto-sent:** "⚠️ Action Required: Odyssey-1 Onboarding Incomplete"
   - Includes your custom reason
   - Includes original onboarding link for re-submission
5. **Database updates:**
   - Status → `rejected`
   - rejection_email_sent_at → current timestamp
   - rejection_email_id → Resend email ID
   - rejected_by → your admin ID
   - rejection_reason → your custom text

---

## 📧 EMAIL TEMPLATES

### 1. Invitation Email
**Subject:** Action Required: Odyssey-1 AI LLC Contractor Onboarding  
**From:** ODYSSEY-1 AI LLC <onboarding@resend.dev>  
**Design:** Blue gradient header, secure onboarding button  
**Content:**
- Welcome message
- March 1st payment cycle deadline
- Requirements checklist (5 minutes)
- Benefits (IRS compliance, direct deposit, 1099 automation)
- Security notice (unique link, 7-day expiration)
- Support: 800-403-8492, generalmanager81@gmail.com

### 2. Approval Email
**Subject:** ✅ Success: Your Odyssey-1 Direct Deposit is Active  
**From:** ODYSSEY-1 AI LLC <onboarding@resend.dev>  
**Design:** Green gradient header with checkmark  
**Content:**
- Congratulations message
- W-9 verified, direct deposit active, status APPROVED
- March 1, 2026 payment start date
- 1099-NEC reminder (January 2027)
- Keep banking info updated

### 3. Rejection Email
**Subject:** ⚠️ Action Required: Odyssey-1 Onboarding Incomplete  
**From:** ODYSSEY-1 AI LLC <onboarding@resend.dev>  
**Design:** Amber gradient header with warning icon  
**Content:**
- Need additional information message
- **Your custom rejection reason** (red-bordered box)
- Re-submission link (original token, valid for 7 days from creation)
- Verification checklist (Tax ID format, banking match, etc.)
- Support contact

---

## 🔍 TRACKING EMAIL DELIVERY

### Database Fields (contractors table):

**Invitation Tracking:**
- `invite_sent_at` - When email sent
- `invite_email_id` - Resend email ID (e.g., `16464886-c761-4318-a7d3-7a9e750ea09a`)
- `email_delivery_status` - Overall status (not_sent, sent, delivered, opened, bounced, failed)

**Approval Tracking:**
- `approval_email_sent_at` - When approval notification sent
- `approval_email_id` - Resend email ID

**Rejection Tracking:**
- `rejection_email_sent_at` - When rejection notification sent
- `rejection_email_id` - Resend email ID

### View Email Logs in Resend:
1. Go to https://resend.com/emails
2. Search by email ID (e.g., `16464886-c761-4318-a7d3-7a9e750ea09a`)
3. View delivery status, opens, clicks, bounces

---

## 🧪 TESTING

### Test Contractor Invite Email:
```bash
node scripts/test-contractor-invite.mjs
```

**What it does:**
- Sends test invitation to generalmanager81@gmail.com
- Uses test contractor "John Smith"
- Returns Resend email ID
- Verifies HTML template rendering

**Expected Output:**
```
✅ SUCCESS! Email sent via Resend

📧 Email Details:
   Email ID: 16464886-c761-4318-a7d3-7a9e750ea09a
   Timestamp: 2026-02-01T22:49:05.851Z
   Recipients: generalmanager81@gmail.com
```

### Full Workflow Test:
1. **Send invite** to your own email (generalmanager81@gmail.com)
2. **Check inbox** (or spam folder)
3. **Click onboarding link** in email
4. **Complete onboarding form** (use test data)
5. **Upload test voided check** (any check image or PDF)
6. **Submit** → Moves to Compliance tab
7. **View check** → Verify image uploaded correctly
8. **Approve** → Check email for approval notification
9. **Verify** contractor status = `approved`

---

## 🚨 TROUBLESHOOTING

### Email Not Sending?
**Check:**
1. ✅ Resend API key set in Supabase secrets (`RESEND_API_KEY`)
2. ✅ Edge Function deployed (`npx supabase functions deploy send-email`)
3. ✅ Environment variables in `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Test Edge Function:**
```bash
node scripts/test-contractor-invite.mjs
```

### Email Going to Spam?
**Solutions:**
- Ask contractor to check spam/junk folder
- Add `onboarding@resend.dev` to safe sender list
- Future: Configure custom domain (e.g., `onboarding@odyssey-1-ai.com`)

### Contractor Can't Access Portal?
**Check:**
1. ✅ Token not expired (created <7 days ago)
2. ✅ Onboarding not already completed (status not `submitted` or `approved`)
3. ✅ Link copied correctly (no extra characters)

**Re-send invite:**
- Go to ContractorManager → Roster tab
- Find contractor (status: pending)
- Click "Resend Invite" (if feature added) OR generate new token

### Voided Check Upload Fails?
**Requirements:**
- File size <5MB
- Format: PDF, JPG, PNG
- Bucket: contractor-docs (must exist)

**Check storage bucket:**
```sql
SELECT * FROM storage.buckets WHERE id = 'contractor-docs';
```

---

## 📊 MARCH 1ST CHECKLIST

### Pre-Launch (Before Sunday):
- [x] Email templates created
- [x] Resend integration tested
- [x] Database migration ready
- [ ] Deploy migration (`npx supabase db push`)
- [ ] Test full contractor workflow
- [ ] Verify direct deposit data exports to payroll system

### Launch Day (Sunday):
- [ ] Send invites to all contractors
- [ ] Monitor email delivery (check Resend dashboard)
- [ ] Follow up with contractors who don't open invites
- [ ] Review submissions in Compliance tab
- [ ] Approve W-9s and voided checks
- [ ] Export approved contractor banking info to Gusto/payroll

### Post-Launch:
- [ ] Send reminder emails 3 days before March 1st to pending contractors
- [ ] Verify first direct deposit batch processes successfully
- [ ] Archive onboarding tokens for completed contractors
- [ ] Prepare 1099-NEC forms for January 2027

---

## 🔐 SECURITY REMINDERS

### Never Share:
- ❌ Onboarding tokens (unique to each contractor)
- ❌ Resend API key
- ❌ Encrypted Tax IDs or account numbers
- ❌ Voided check images

### Admin Access Only:
- ✅ Compliance tab (view pending approvals)
- ✅ Voided check viewer
- ✅ Approve/reject buttons
- ✅ contractor-docs storage bucket

### Contractor Self-Service:
- ✅ Onboarding portal (token-validated)
- ✅ Upload own voided check
- ✅ Provide own Tax ID
- ✅ Digital signature

---

## 📞 SUPPORT

**Email Issues:**
- Resend Dashboard: https://resend.com/emails
- Email capacity: 3,000/month (FREE tier)

**System Issues:**
- Phone: 800-403-8492
- Email: generalmanager81@gmail.com

**Database Issues:**
- Supabase Dashboard: https://supabase.com/dashboard
- Check logs in Edge Functions tab

---

**Last Updated:** 2026-02-01  
**Status:** ✅ OPERATIONAL  

🛰️ **ODYSSEY-1 AI LLC** | Contractor Onboarding System
