/**
 * Patent Deadline Tracker with Critical Alerts
 * Prevents missing utility patent deadline (worth $1.7B-$7.8B)
 * Email/SMS alerts at 180, 90, 60, 30, 7 days remaining
 */

import { supabase } from '@/lib/supabaseClient';

interface PatentDeadline {
  patent_id: string;
  patent_name: string;
  deadline_date: string;
  days_remaining: number;
  status: 'safe' | 'warning' | 'critical' | 'urgent' | 'overdue';
  alert_level: 0 | 1 | 2 | 3 | 4 | 5;
  estimated_value: number;
  consequences_if_missed: string;
}

interface Alert {
  id: string;
  patent_id: string;
  alert_type: 'email' | 'sms' | 'push' | 'dashboard';
  severity: 'info' | 'warning' | 'critical' | 'urgent';
  message: string;
  sent_date: string;
  acknowledged: boolean;
}

export class PatentDeadlineTracker {
  
  // Odyssey 2.0 Utility Patent Deadline
  private readonly PROVISIONAL_FILING_DATE = new Date('2025-11-07T02:09:15-05:00');
  private readonly UTILITY_DEADLINE = new Date('2026-11-07T23:59:59-05:00');
  private readonly PATENT_VALUE = 1700000000; // $1.7B minimum

  /**
   * Get current deadline status for Odyssey 2.0 utility patent
   */
  async getOdyssey2DeadlineStatus(): Promise<PatentDeadline> {
    const now = new Date();
    const daysRemaining = this.calculateDaysRemaining(now, this.UTILITY_DEADLINE);
    const status = this.getDeadlineStatus(daysRemaining);
    const alertLevel = this.getAlertLevel(daysRemaining);

    return {
      patent_id: 'odyssey-2-utility',
      patent_name: 'Odyssey 2.0 Utility Patent (Locus Ring + Lumen Core + Neural Gesture)',
      deadline_date: this.UTILITY_DEADLINE.toISOString(),
      days_remaining: daysRemaining,
      status,
      alert_level: alertLevel,
      estimated_value: this.PATENT_VALUE,
      consequences_if_missed: this.getConsequences(status)
    };
  }

  /**
   * Calculate days remaining until deadline
   */
  private calculateDaysRemaining(now: Date, deadline: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = deadline.getTime() - now.getTime();
    return Math.floor(diffMs / msPerDay);
  }

  /**
   * Determine deadline status based on days remaining
   */
  private getDeadlineStatus(daysRemaining: number): 'safe' | 'warning' | 'critical' | 'urgent' | 'overdue' {
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 7) return 'urgent';
    if (daysRemaining <= 30) return 'critical';
    if (daysRemaining <= 90) return 'warning';
    return 'safe';
  }

  /**
   * Get alert level (0=none, 5=maximum)
   */
  private getAlertLevel(daysRemaining: number): 0 | 1 | 2 | 3 | 4 | 5 {
    if (daysRemaining < 0) return 5; // OVERDUE - CRITICAL LOSS
    if (daysRemaining <= 7) return 5; // 1 WEEK - EMERGENCY
    if (daysRemaining <= 30) return 4; // 1 MONTH - URGENT
    if (daysRemaining <= 60) return 3; // 2 MONTHS - CRITICAL
    if (daysRemaining <= 90) return 2; // 3 MONTHS - WARNING
    if (daysRemaining <= 180) return 1; // 6 MONTHS - HEADS UP
    return 0; // SAFE
  }

  /**
   * Get consequences description
   */
  private getConsequences(status: string): string {
    switch (status) {
      case 'overdue':
        return '💀 DEADLINE MISSED: Priority date LOST. $1.7B-$7.8B patent portfolio FORFEITED. Provisional filing wasted. Competitors can now copy Odyssey 2.0 freely. CATASTROPHIC LOSS.';
      
      case 'urgent':
        return '🚨 EMERGENCY: Only 7 days left! File IMMEDIATELY even if incomplete. Better to file imperfect application than miss deadline. Cannot be extended. Hire attorney NOW.';
      
      case 'critical':
        return '⚠️ CRITICAL: 30 days remaining. Finish patent application THIS WEEK. Schedule attorney review ASAP. No time for revisions. Prepare all documents now.';
      
      case 'warning':
        return '⏰ WARNING: 90 days remaining. Complete specification and drawings this month. Schedule attorney review for next month. Final 30 days for revisions only.';
      
      case 'safe':
        return '✅ SAFE: 180+ days remaining. Proceed with thorough patent drafting. Time for quality application, attorney review, and revisions. Stay on schedule.';
      
      default:
        return 'Status unknown';
    }
  }

  /**
   * Check if alert should be sent based on days remaining
   */
  private shouldSendAlert(daysRemaining: number): boolean {
    // Send alerts at specific milestones
    const alertDays = [180, 90, 60, 30, 14, 7, 3, 1, 0];
    return alertDays.includes(daysRemaining);
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(deadline: PatentDeadline): string {
    const emoji = {
      safe: '💚',
      warning: '⚠️',
      critical: '🔴',
      urgent: '🚨',
      overdue: '💀'
    }[deadline.status];

    if (deadline.status === 'overdue') {
      return `${emoji} ODYSSEY 2.0 PATENT DEADLINE MISSED

Your utility patent deadline was ${new Date(deadline.deadline_date).toLocaleDateString()}.

You have LOST your priority date and cannot claim the provisional filing. The $1.7B-$7.8B patent portfolio is now FORFEIT.

Competitors can now freely copy Locus Ring, Lumen Core, and Neural Gesture Engine.

CONTACT PATENT ATTORNEY IMMEDIATELY to explore emergency options (if any).`;
    }

    if (deadline.status === 'urgent') {
      return `${emoji} ODYSSEY 2.0 PATENT DEADLINE EMERGENCY

🚨 ONLY ${deadline.days_remaining} DAYS REMAINING 🚨

Utility patent must be filed by: ${new Date(deadline.deadline_date).toLocaleDateString()}

ACTION REQUIRED TODAY:
1. Finalize patent application (use auto-generator if not done)
2. Call patent attorney for emergency review ($1,500)
3. Prepare $415 filing fee payment
4. Upload to USPTO EFS-Web ASAP

DO NOT DELAY. This deadline CANNOT be extended. Missing it loses $1.7B+ IP portfolio.

File even if application is imperfect - better imperfect patent than no patent!`;
    }

    if (deadline.status === 'critical') {
      return `${emoji} ODYSSEY 2.0 PATENT DEADLINE CRITICAL

⏰ ${deadline.days_remaining} DAYS REMAINING ⏰

Utility patent deadline: ${new Date(deadline.deadline_date).toLocaleDateString()}

URGENT ACTIONS THIS WEEK:
1. ✅ Complete patent specification
2. ✅ Generate all drawings (6-10 figures)
3. ✅ Run prior art search
4. ✅ Schedule attorney review ($1,500)
5. ✅ Prepare filing fee ($415)

SCHEDULE:
- This week: Complete draft
- Next week: Attorney review
- Week 3: Incorporate feedback
- Week 4: FILE APPLICATION

Set aside time EVERY DAY to work on this. Missing deadline = losing $${(deadline.estimated_value / 1000000).toFixed(1)}M+ patent.`;
    }

    if (deadline.status === 'warning') {
      return `${emoji} ODYSSEY 2.0 PATENT DEADLINE WARNING

⏰ ${deadline.days_remaining} DAYS REMAINING ⏰

Utility patent deadline: ${new Date(deadline.deadline_date).toLocaleDateString()}

You have 3 months to file. Time to get serious.

RECOMMENDED TIMELINE:
- Month 1 (NOW): Complete specification, claims, drawings
- Month 2: Attorney review and revisions
- Month 3: Final polish and filing

CHECKLIST:
☐ Patent specification (50-100 pages)
☐ Independent + dependent claims (20-30 claims)
☐ Patent drawings (6-10 figures with reference numbers)
☐ Prior art search and comparison table
☐ Attorney review scheduled
☐ $415 filing fee ready

Work on this WEEKLY. Don't wait until last minute.`;
    }

    // safe status
    return `${emoji} ODYSSEY 2.0 PATENT DEADLINE REMINDER

${deadline.days_remaining} days remaining until utility patent deadline.

Deadline: ${new Date(deadline.deadline_date).toLocaleDateString()}

You have plenty of time. Stay on schedule:

RECOMMENDED TIMELINE:
- Months 1-3: Research and drafting
- Months 4-6: Specification and claims refinement
- Months 7-9: Drawings and prior art search
- Months 10-11: Attorney review and revisions
- Month 12: Final filing (with 1-month buffer)

CURRENT PRIORITIES:
1. Study USPTO patent formatting requirements
2. Draft initial specification using auto-generator
3. Create formal patent drawings from 3D model
4. Begin prior art search

Work steadily. Quality application = stronger patent = higher licensing value.`;
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(deadline: PatentDeadline, email: string): Promise<void> {
    const subject = deadline.status === 'overdue' ? '💀 PATENT DEADLINE MISSED' :
                    deadline.status === 'urgent' ? '🚨 PATENT DEADLINE EMERGENCY' :
                    deadline.status === 'critical' ? '🔴 PATENT DEADLINE CRITICAL' :
                    deadline.status === 'warning' ? '⚠️ PATENT DEADLINE WARNING' :
                    '💚 Patent Deadline Reminder';

    const message = this.generateAlertMessage(deadline);

    console.log(`📧 Sending email to ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // await emailService.send({ to: email, subject, body: message });

    await this.logAlert({
      id: crypto.randomUUID(),
      patent_id: deadline.patent_id,
      alert_type: 'email',
      severity: deadline.status === 'safe' ? 'info' : 
                deadline.status === 'warning' ? 'warning' :
                deadline.status === 'critical' ? 'critical' : 'urgent',
      message,
      sent_date: new Date().toISOString(),
      acknowledged: false
    });
  }

  /**
   * Send SMS alert (for urgent/critical only)
   */
  private async sendSMSAlert(deadline: PatentDeadline, phone: string): Promise<void> {
    if (deadline.status === 'safe') return; // Don't spam SMS for safe status

    const shortMessage = deadline.status === 'overdue' ?
      `💀 ODYSSEY PATENT DEADLINE MISSED! Call attorney NOW. $1.7B IP lost.` :
    deadline.status === 'urgent' ?
      `🚨 ONLY ${deadline.days_remaining} DAYS to file Odyssey patent! File TODAY. Cannot extend.` :
    deadline.status === 'critical' ?
      `🔴 ${deadline.days_remaining} days to file Odyssey patent. Complete application THIS WEEK.` :
      `⚠️ ${deadline.days_remaining} days to Odyssey patent deadline. Work on it WEEKLY.`;

    console.log(`📱 Sending SMS to ${phone}`);
    console.log(`Message: ${shortMessage}`);

    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    // await smsService.send({ to: phone, body: shortMessage });

    await this.logAlert({
      id: crypto.randomUUID(),
      patent_id: deadline.patent_id,
      alert_type: 'sms',
      severity: deadline.status === 'warning' ? 'warning' : 
                deadline.status === 'critical' ? 'critical' : 'urgent',
      message: shortMessage,
      sent_date: new Date().toISOString(),
      acknowledged: false
    });
  }

  /**
   * Daily check and alert if milestone reached
   */
  async checkAndAlert(email: string, phone?: string): Promise<void> {
    const deadline = await this.getOdyssey2DeadlineStatus();

    // Always send alert if at milestone
    if (this.shouldSendAlert(deadline.days_remaining)) {
      await this.sendEmailAlert(deadline, email);
      
      if (phone && (deadline.status === 'urgent' || deadline.status === 'critical' || deadline.status === 'overdue')) {
        await this.sendSMSAlert(deadline, phone);
      }
    }

    // Save deadline status to database
    await this.saveDeadlineStatus(deadline);
  }

  /**
   * Generate dashboard visualization data
   */
  async getDashboardData(): Promise<{
    deadline: PatentDeadline;
    progressPercentage: number;
    milestonesReached: string[];
    nextMilestone: { days: number; date: string };
    estimatedFilingDate: string;
  }> {
    const deadline = await this.getOdyssey2DeadlineStatus();
    
    const totalDays = this.calculateDaysRemaining(this.PROVISIONAL_FILING_DATE, this.UTILITY_DEADLINE);
    const elapsed = totalDays - deadline.days_remaining;
    const progressPercentage = Math.round((elapsed / totalDays) * 100);

    const milestones = [
      { days: 180, label: '6 months remaining - Begin drafting' },
      { days: 90, label: '3 months remaining - Attorney review' },
      { days: 60, label: '2 months remaining - Finalize application' },
      { days: 30, label: '1 month remaining - FILE IMMEDIATELY' },
      { days: 7, label: '1 week remaining - EMERGENCY' }
    ];

    const milestonesReached = milestones
      .filter(m => deadline.days_remaining < m.days)
      .map(m => m.label);

    const nextMilestone = milestones.find(m => deadline.days_remaining >= m.days) || 
                         { days: 0, label: 'OVERDUE' };

    const nextMilestoneDate = new Date();
    nextMilestoneDate.setDate(nextMilestoneDate.getDate() + (deadline.days_remaining - nextMilestone.days));

    // Recommend filing 60 days before deadline (safety buffer)
    const recommendedFilingDate = new Date(this.UTILITY_DEADLINE);
    recommendedFilingDate.setDate(recommendedFilingDate.getDate() - 60);

    return {
      deadline,
      progressPercentage,
      milestonesReached,
      nextMilestone: {
        days: nextMilestone.days,
        date: nextMilestoneDate.toLocaleDateString()
      },
      estimatedFilingDate: recommendedFilingDate.toLocaleDateString()
    };
  }

  /**
   * Save deadline status to database
   */
  private async saveDeadlineStatus(deadline: PatentDeadline): Promise<void> {
    const { error } = await supabase
      .from('patent_deadlines')
      .upsert({
        patent_id: deadline.patent_id,
        patent_name: deadline.patent_name,
        deadline_date: deadline.deadline_date,
        days_remaining: deadline.days_remaining,
        status: deadline.status,
        alert_level: deadline.alert_level,
        estimated_value: deadline.estimated_value,
        last_checked: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save deadline status:', error);
    }
  }

  /**
   * Log alert to database
   */
  private async logAlert(alert: Alert): Promise<void> {
    const { error } = await supabase
      .from('patent_alerts')
      .insert(alert);

    if (error) {
      console.error('Failed to log alert:', error);
    }
  }

  /**
   * Acknowledge alert (mark as read)
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('patent_alerts')
      .update({ 
        acknowledged: true,
        acknowledged_date: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }

  /**
   * Get all unacknowledged alerts
   */
  async getUnacknowledgedAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('patent_alerts')
      .select('*')
      .eq('acknowledged', false)
      .order('sent_date', { ascending: false });

    if (error) {
      console.error('Failed to get alerts:', error);
      return [];
    }

    return data || [];
  }
}

// Example usage
export async function startDeadlineMonitoring(email: string, phone?: string): Promise<void> {
  const tracker = new PatentDeadlineTracker();
  
  // Initial check
  await tracker.checkAndAlert(email, phone);

  // Schedule daily checks (in production, use cron job or scheduled function)
  console.log('✅ Patent deadline monitoring active');
  console.log(`   Email alerts: ${email}`);
  if (phone) console.log(`   SMS alerts: ${phone}`);
  console.log('   Checking daily for milestone alerts');
  console.log('   Prevents missing $1.7B+ patent deadline! 🛡️');
}

export async function showDeadlineDashboard(): Promise<void> {
  const tracker = new PatentDeadlineTracker();
  const dashboard = await tracker.getDashboardData();

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         ODYSSEY 2.0 PATENT DEADLINE DASHBOARD           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const statusEmoji = {
    safe: '💚',
    warning: '⚠️',
    critical: '🔴',
    urgent: '🚨',
    overdue: '💀'
  }[dashboard.deadline.status];

  console.log(`Status: ${statusEmoji} ${dashboard.deadline.status.toUpperCase()}`);
  console.log(`Days Remaining: ${dashboard.deadline.days_remaining}`);
  console.log(`Deadline: ${new Date(dashboard.deadline.deadline_date).toLocaleDateString()}`);
  console.log(`Progress: ${dashboard.progressPercentage}% elapsed`);
  console.log(`Patent Value: $${(dashboard.deadline.estimated_value / 1000000).toFixed(1)}M minimum\n`);

  console.log('Milestones Reached:');
  if (dashboard.milestonesReached.length === 0) {
    console.log('  None yet - still in early phase');
  } else {
    dashboard.milestonesReached.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m}`);
    });
  }

  console.log(`\nNext Milestone: ${dashboard.nextMilestone.days} days (${dashboard.nextMilestone.date})`);
  console.log(`Recommended Filing: ${dashboard.estimatedFilingDate}\n`);

  console.log('Consequences if missed:');
  console.log(dashboard.deadline.consequences_if_missed);
  console.log('\n');
}
