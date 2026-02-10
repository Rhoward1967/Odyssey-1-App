/**
 * FCRA Compliance Monitoring Service
 * 
 * Purpose: Monitor certified mail tracking for approaching deadlines
 * Scope: Objective timeline tracking only - no legal conclusions
 * 
 * This service checks the certified_mail_tracking table daily and alerts
 * when response deadlines are approaching or have passed.
 */

import { supabase } from '@/lib/supabaseClient';
import { differenceInDays, format } from 'date-fns';

interface TrackingRecord {
  id: string;
  entity_name: string;
  entity_type: string;
  tracking_number: string;
  mail_date: string;
  delivery_date: string | null;
  response_deadline: string;
  response_received: boolean;
  response_date: string | null;
  verification_provided: boolean;
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
      .order('response_deadline', { ascending: true });

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

    const total_mailings = records.length;
    const responses_received = records.filter(r => r.response_received).length;
    const pending_responses = records.filter(r => !r.response_received).length;

    const approaching_deadline = records.filter(r => {
      if (r.response_received) return false;
      const daysUntil = differenceInDays(new Date(r.response_deadline), now);
      return daysUntil >= 0 && daysUntil <= 7;
    });

    const overdue = records.filter(r => {
      if (r.response_received) return false;
      const daysUntil = differenceInDays(new Date(r.response_deadline), now);
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
        const daysLeft = differenceInDays(new Date(r.response_deadline), now);
        summary += `  • ${r.entity_name} (${r.entity_type}): ${daysLeft} days remaining\n`;
      });
      summary += `\n`;
    }

    if (overdue_count > 0) {
      summary += `🔴 NON-RESPONSIVE (Past Deadline):\n`;
      overdue.forEach(r => {
        const daysOverdue = Math.abs(differenceInDays(new Date(r.response_deadline), now));
        summary += `  • ${r.entity_name} (${r.entity_type}): ${daysOverdue} days overdue\n`;
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
      if (r.response_received) return false;
      const daysUntil = differenceInDays(new Date(r.response_deadline), now);
      return daysUntil < 3; // Critical if less than 3 days or overdue
    });
  }

  /**
   * Mark a response as received
   */
  async markResponseReceived(
    trackingId: string, 
    verificationProvided: boolean, 
    notes?: string
  ): Promise<void> {
    const updates: any = {
      response_received: true,
      response_date: new Date().toISOString(),
      verification_provided: verificationProvided,
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
        subcategory: 'daily_check',
        key_name: `fcra_check_${format(new Date(), 'yyyy-MM-dd')}`,
        value: report.summary,
        metadata: {
          total_mailings: report.total_mailings,
          responses_received: report.responses_received,
          overdue_count: report.overdue_count,
          approaching_count: report.approaching_deadline.length,
        } as any,
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error('Error logging monitoring check:', error);
    }
  }
}

export const fcraMonitoring = new FCRAMonitoringService();
