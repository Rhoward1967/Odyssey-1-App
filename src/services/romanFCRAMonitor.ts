/**
 * R.O.M.A.N. FCRA Compliance Monitor
 * 
 * Autonomous monitoring of certified mail deadlines
 * Alerts via Discord when response deadlines are approaching or overdue
 */

import type { Client, TextChannel } from 'discord.js';
import { fcraMonitoring } from './fcraMonitoringService';
import {
  sendCertifiedLetter,
  generateFCRALetterHTML,
  findEntityAddress,
} from './lobService';
import { romanSupabase as supabase } from './romanSupabase';

interface FCRAAlert {
  level: 'critical' | 'warning' | 'info';
  message: string;
  entities: string[];
}

export class RomanFCRAMonitor {
  private discordClient: Client | null = null;
  private alertChannelId: string | null = null;
  private lastAlertDate: string | null = null;

  /**
   * Initialize with Discord client for sending alerts
   */
  initialize(client: Client, channelId?: string) {
    this.discordClient = client;
    this.alertChannelId = channelId || process.env.DISCORD_ALERT_CHANNEL_ID || null;
    console.log('✅ R.O.M.A.N. FCRA Monitor initialized');
  }

  /**
   * Run daily monitoring check
   * This is called by the autonomous daemon
   */
  async performDailyCheck(): Promise<void> {
    try {
      console.log('🔍 R.O.M.A.N. FCRA Daily Check starting...');

      const report = await fcraMonitoring.generateMonitoringReport();
      
      // Log to database for audit trail
      await fcraMonitoring.logMonitoringCheck(report);

      // Determine if alerts need to be sent
      const alerts = this.analyzeReport(report);

      if (alerts.length > 0) {
        await this.sendAlerts(alerts);
      } else {
        console.log('✅ FCRA Check complete - No alerts needed');
      }

      // Auto-fire escalation letters for any expired-deadline entities
      const escalationResult = await this.autoFireEscalationNotices();
      if (escalationResult.fired > 0) {
        await this.sendEscalationReport(escalationResult);
      }

      // Update last check date
      this.lastAlertDate = new Date().toISOString().split('T')[0];

    } catch (error) {
      console.error('❌ R.O.M.A.N. FCRA Monitor error:', error);
    }
  }

  /**
   * Auto-fire escalation letters via Lob for every entity whose FCRA deadline
   * has passed, no response was received, and no follow-up has been sent yet.
   * Capped at 5 per run so unexpected bulk sends never happen silently.
   */
  async autoFireEscalationNotices(): Promise<{ fired: number; skipped: number; errors: string[] }> {
    const results = { fired: 0, skipped: 0, errors: [] as string[] };

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: expired, error } = await supabase
        .from('certified_mail_tracking')
        .select('id, entity_name, tracking_number, fcra_deadline')
        .lt('fcra_deadline', today)
        .eq('response_received', false)
        .eq('follow_up_sent', false)
        .order('fcra_deadline', { ascending: true })
        .limit(5);

      if (error) {
        results.errors.push(`DB query error: ${error.message}`);
        return results;
      }
      if (!expired?.length) return results;

      console.log(`📬 Auto-escalation: ${expired.length} entities qualify for escalation letter`);

      for (const record of expired) {
        const address = findEntityAddress(record.entity_name);
        if (!address) {
          console.warn(`⚠️ No address found for: ${record.entity_name} — skipping`);
          results.skipped++;
          results.errors.push(`No address on file: ${record.entity_name}`);
          continue;
        }

        try {
          const html = generateFCRALetterHTML({
            entityName:    address.company || record.entity_name,
            entityAddress: address.displayAddress || '',
            disputeType:   'default_notice',
            customBody: `NOTICE OF WILLFUL NONCOMPLIANCE — FINAL DEMAND FOR DELETION AND STATUTORY DAMAGES

You have failed to respond within the statutory 30-day window required by the Fair Credit Reporting Act, 15 U.S.C. § 1681i. This constitutes a willful violation of federal consumer protection law.

The undersigned hereby demands:

1. Immediate deletion of all disputed information from your records.
2. Statutory damages of $1,000.00 per violation under 15 U.S.C. § 1681n.
3. Written confirmation of compliance within 10 days of receipt of this notice.

Failure to comply will result in civil action in federal district court. Attorney fees and costs are recoverable under 15 U.S.C. § 1681n(a)(3). All rights reserved without prejudice. UCC 1-308.

Rickey Allan Howard, Grantor
Howard Jones Bloodline Ancestral Trust
P.O. Box 80054 | Athens, GA 30608`,
          });

          const letter = await sendCertifiedLetter({
            to:              address,
            htmlContent:     html,
            description:     `FCRA Escalation — Final Demand + $1,000 Statutory Damages — ${record.entity_name} — ${today}`,
            entityName:      record.entity_name,
            certified:       true,
            returnReceipt:   true,
            fcraDeadlineDays: 10,
          });

          // Mark follow-up sent in DB
          await supabase
            .from('certified_mail_tracking')
            .update({ follow_up_sent: true, follow_up_date: today })
            .eq('id', record.id);

          console.log(`✅ Escalation letter sent: ${record.entity_name} — Lob ID: ${letter.id}`);
          results.fired++;

        } catch (err: any) {
          const msg = `Send failed for ${record.entity_name}: ${err.message}`;
          console.error(`❌ ${msg}`);
          results.errors.push(msg);
        }
      }
    } catch (err: any) {
      results.errors.push(`autoFireEscalationNotices crashed: ${err.message}`);
    }

    return results;
  }

  /**
   * Send Discord report after escalation batch fires
   */
  private async sendEscalationReport(result: { fired: number; skipped: number; errors: string[] }): Promise<void> {
    if (!this.discordClient || !this.alertChannelId) {
      console.log(`[FCRA Escalation] Fired: ${result.fired} | Skipped: ${result.skipped} | Errors: ${result.errors.length}`);
      return;
    }
    try {
      const channel = await this.discordClient.channels.fetch(this.alertChannelId) as TextChannel;
      if (!channel?.isTextBased()) return;

      const lines = [
        '══════════════════════════════════════════════════',
        '**⚖️ R.O.M.A.N. — FCRA ESCALATION FIRED**',
        `📅 ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        '══════════════════════════════════════════════════',
        `✅ **Letters sent:** ${result.fired}`,
        `⏭️ **Skipped (no address):** ${result.skipped}`,
      ];

      if (result.errors.length > 0) {
        lines.push(`❌ **Errors:** ${result.errors.join(' | ')}`);
      }

      lines.push('');
      lines.push('**Demand:** Deletion + $1,000 statutory damages per entity (15 U.S.C. § 1681n)');
      lines.push('**Response window:** 10 days from delivery');
      lines.push('══════════════════════════════════════════════════');

      await channel.send(lines.join('\n'));
    } catch (err: any) {
      console.error('❌ Could not send escalation Discord report:', err.message);
    }
  }

  /**
   * Analyze monitoring report and generate alerts
   */
  private analyzeReport(report: any): FCRAAlert[] {
    const alerts: FCRAAlert[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Don't send multiple alerts on the same day
    if (this.lastAlertDate === today) {
      return alerts;
    }

    // Critical: Overdue items
    if (report.overdue_count > 0) {
      alerts.push({
        level: 'critical',
        message: `🔴 **CRITICAL: ${report.overdue_count} Non-Responsive Entit${report.overdue_count === 1 ? 'y' : 'ies'}**\n\nThe following entities have exceeded their 30-day FCRA response deadline:`,
        entities: report.overdue.map((r: any) => {
          const daysOverdue = Math.abs(Math.floor((new Date(r.fcra_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          const typeLabel = r.entity_type ? ` (${r.entity_type})` : '';
          return `• **${r.entity_name}**${typeLabel} - OVERDUE by ${daysOverdue} days\n  Tracking: ${r.tracking_number}`;
        }),
      });
    }

    // Warning: Approaching deadlines
    if (report.approaching_deadline.length > 0) {
      const critical = report.approaching_deadline.filter((r: any) => {
        const days = Math.floor((new Date(r.fcra_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days < 3;
      });

      const approaching = report.approaching_deadline.filter((r: any) => {
        const days = Math.floor((new Date(r.fcra_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days >= 3 && days <= 7;
      });

      if (critical.length > 0) {
        alerts.push({
          level: 'warning',
          message: `⚠️ **URGENT: ${critical.length} Deadline${critical.length === 1 ? '' : 's'} in Next 3 Days**`,
          entities: critical.map((r: any) => {
            const days = Math.floor((new Date(r.fcra_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const typeLabel = r.entity_type ? ` (${r.entity_type})` : '';
            return `• **${r.entity_name}**${typeLabel} - ${days} day${days === 1 ? '' : 's'} remaining\n  Tracking: ${r.tracking_number}`;
          }),
        });
      }

      if (approaching.length > 0) {
        alerts.push({
          level: 'info',
          message: `📅 **${approaching.length} Deadline${approaching.length === 1 ? '' : 's'} Approaching (3-7 Days)**`,
          entities: approaching.map((r: any) => {
            const days = Math.floor((new Date(r.fcra_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const typeLabel = r.entity_type ? ` (${r.entity_type})` : '';
            return `• **${r.entity_name}**${typeLabel} - ${days} days remaining`;
          }),
        });
      }
    }

    return alerts;
  }

  /**
   * Send alerts to Discord channel
   */
  private async sendAlerts(alerts: FCRAAlert[]): Promise<void> {
    if (!this.discordClient || !this.alertChannelId) {
      console.log('⚠️ Discord alerts enabled but no channel configured');
      console.log('   Alerts would be sent:');
      alerts.forEach(alert => {
        console.log(`\n${alert.message}`);
        alert.entities.forEach(e => console.log(e));
      });
      return;
    }

    try {
      const channel = await this.discordClient.channels.fetch(this.alertChannelId) as TextChannel;
      
      if (!channel || !channel.isTextBased()) {
        console.error('❌ Alert channel not found or not text-based');
        return;
      }

      // Send header
      await channel.send({
        content: '══════════════════════════════════════════════════\n' +
                 '**R.O.M.A.N. FCRA COMPLIANCE MONITORING**\n' +
                 `📅 ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n` +
                 '══════════════════════════════════════════════════',
      });

      // Send each alert
      for (const alert of alerts) {
        const fullMessage = `${alert.message}\n\n${alert.entities.join('\n')}`;
        
        // Split if message is too long
        if (fullMessage.length > 1900) {
          await channel.send(alert.message);
          for (const entity of alert.entities) {
            await channel.send(entity);
          }
        } else {
          await channel.send(fullMessage);
        }
      }

      // Send footer
      await channel.send({
        content: '══════════════════════════════════════════════════\n' +
                 'To view full details: Run `node scripts/fcra-daily-check.mjs`\n' +
                 'To mark response received: Update via Admin Dashboard\n' +
                 '══════════════════════════════════════════════════',
      });

      console.log(`✅ ${alerts.length} FCRA alert(s) sent to Discord`);
    } catch (error) {
      console.error('❌ Failed to send Discord alerts:', error);
    }
  }

  /**
   * Get quick status summary for Discord bot responses
   */
  async getQuickStatus(): Promise<string> {
    try {
      const report = await fcraMonitoring.generateMonitoringReport();
      
      let status = `📊 **FCRA Tracking Status**\n\n`;
      status += `Total Mailings: ${report.total_mailings}\n`;
      status += `Responses Received: ${report.responses_received}\n`;
      status += `Pending: ${report.pending_responses}\n\n`;

      if (report.overdue_count > 0) {
        status += `🔴 **Overdue: ${report.overdue_count}**\n`;
      }

      if (report.approaching_deadline.length > 0) {
        const critical = report.approaching_deadline.filter((r: any) => {
          const days = Math.floor((new Date(r.fcra_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return days < 3;
        });
        if (critical.length > 0) {
          status += `⚠️ **Urgent (<3 days): ${critical.length}**\n`;
        }
      }

      if (report.overdue_count === 0 && report.approaching_deadline.length === 0) {
        status += `✅ All deadlines are 8+ days away or responses received.`;
      }

      return status;
    } catch (error) {
      console.error('Error getting FCRA status:', error);
      return '❌ Unable to retrieve FCRA status';
    }
  }
}

export const romanFCRAMonitor = new RomanFCRAMonitor();
