/**
 * FCRA Compliance Monitoring Service
 * 
 * Purpose: Monitor certified mail tracking for approaching deadlines
 * Scope: Objective timeline tracking only - no legal conclusions
 * 
 * This service checks the certified_mail_tracking table daily and alerts
 * when response deadlines are approaching or have passed.
 */

// Use service role for system operations (bypasses RLS)
import { romanSupabase as supabase } from './romanSupabase';
import { differenceInDays, format } from 'date-fns';

interface TrackingRecord {
  id: string;
  entity_name: string;
  entity_type?: string | null;
  tracking_number: string;
  date_mailed: string;
  fcra_deadline: string;
  status: string;
  response_received: boolean;
  notes: string | null;
}

interface MonitoringReport {
  timestamp: string;
  total_mailings: number;
  responses_received: number;
  pending_responses: number;
  overdue_count: number;
  approaching_deadline: TrackingRecord[];
  overdue: TrackingRecord[];
  summary: string;
}

export class FCRAMonitoringService {
  
  /**
   * Get current status of all certified mail tracking
   */
  async getTrackingStatus(): Promise<TrackingRecord[]> {
    const { data, error } = await supabase
      .from('certified_mail_tracking')
      .select('*')
      .order('fcra_deadline', { ascending: true });

    if (error) {
      console.error('Error fetching tracking data:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Generate daily monitoring report
   * This can be called by R.O.M.A.N. or scheduled tasks
   */
  async generateMonitoringReport(): Promise<MonitoringReport> {
    const records = await this.getTrackingStatus();
    const now = new Date();

    const hasResponded = (r: TrackingRecord) => r.status === 'responded' || r.response_received;

    const total_mailings = records.length;
    const responses_received = records.filter(r => hasResponded(r)).length;
    const pending_responses = records.filter(r => !hasResponded(r)).length;

    const approaching_deadline = records.filter(r => {
      if (hasResponded(r)) return false;
      const daysUntil = differenceInDays(new Date(r.fcra_deadline), now);
      return daysUntil >= 0 && daysUntil <= 7;
    });

    const overdue = records.filter(r => {
      if (hasResponded(r)) return false;
      const daysUntil = differenceInDays(new Date(r.fcra_deadline), now);
      return daysUntil < 0;
    });

    const overdue_count = overdue.length;

    // Generate summary text
    let summary = `FCRA Tracking Status (${format(now, 'MMM d, yyyy')})\n\n`;
    summary += `Total Mailings: ${total_mailings}\n`;
    summary += `Responses Received: ${responses_received}\n`;
    summary += `Pending Responses: ${pending_responses}\n`;
    summary += `Overdue (Non-Responsive): ${overdue_count}\n\n`;

    if (approaching_deadline.length > 0) {
      summary += `⚠️ DEADLINES APPROACHING (≤7 days):\n`;
      approaching_deadline.forEach(r => {
        const daysLeft = differenceInDays(new Date(r.fcra_deadline), now);
        const typeLabel = r.entity_type ? ` (${r.entity_type})` : '';
        summary += `  • ${r.entity_name}${typeLabel}: ${daysLeft} days remaining\n`;
      });
      summary += `\n`;
    }

    if (overdue_count > 0) {
      summary += `🔴 NON-RESPONSIVE (Past Deadline):\n`;
      overdue.forEach(r => {
        const daysOverdue = Math.abs(differenceInDays(new Date(r.fcra_deadline), now));
        const typeLabel = r.entity_type ? ` (${r.entity_type})` : '';
        summary += `  • ${r.entity_name}${typeLabel}: ${daysOverdue} days overdue\n`;
      });
      summary += `\n`;
    }

    if (approaching_deadline.length === 0 && overdue_count === 0) {
      summary += `✅ No urgent actions required. All deadlines are 8+ days away or responses received.\n`;
    }

    return {
      timestamp: now.toISOString(),
      total_mailings,
      responses_received,
      pending_responses,
      overdue_count,
      approaching_deadline,
      overdue,
      summary,
    };
  }

  /**
   * Check if any alerts should be sent
   * Returns true if there are approaching deadlines or overdue items
   */
  async shouldAlert(): Promise<boolean> {
    const report = await this.generateMonitoringReport();
    return report.approaching_deadline.length > 0 || report.overdue_count > 0;
  }

  /**
   * Get entities that need immediate attention (overdue or <3 days)
   */
  async getCriticalItems(): Promise<TrackingRecord[]> {
    const records = await this.getTrackingStatus();
    const now = new Date();

    return records.filter(r => {
      if (r.status === 'responded' || r.response_received) return false;
      const daysUntil = differenceInDays(new Date(r.fcra_deadline), now);
      return daysUntil < 3;
    });
  }

  /**
   * Mark a response as received
   */
  async markResponseReceived(
    trackingId: string,
    notes?: string
  ): Promise<void> {
    const updates: any = {
      status: 'responded',
    };

    if (notes) {
      updates.notes = notes;
    }

    const { error } = await supabase
      .from('certified_mail_tracking')
      .update(updates)
      .eq('id', trackingId);

    if (error) {
      console.error('Error updating tracking record:', error);
      throw error;
    }
  }

  /**
   * Log monitoring check to system_knowledge for audit trail
   */
  async logMonitoringCheck(report: MonitoringReport): Promise<void> {
    const { error } = await supabase
      .from('system_knowledge')
      .insert({
        category: 'fcra_monitoring',
        knowledge_key: `fcra_check_${format(new Date(), 'yyyy-MM-dd')}`,
        value: {
          summary: report.summary,
          total_mailings: report.total_mailings,
          responses_received: report.responses_received,
          overdue_count: report.overdue_count,
          approaching_count: report.approaching_deadline.length,
          check_date: new Date().toISOString()
        },
        learned_from: 'fcra_daily_monitoring',
        updated_at: new Date().toISOString()
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error('Error logging monitoring check:', error);
    }
  }
}

export const fcraMonitoring = new FCRAMonitoringService();
