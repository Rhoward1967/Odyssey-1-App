/**
 * R.O.M.A.N. FCRA Compliance Monitor
 * 
 * Autonomous monitoring of certified mail deadlines
 * Alerts via Discord when response deadlines are approaching or overdue
 */

import { fcraMonitoring } from './fcraMonitoringService';
import type { Client, TextChannel } from 'discord.js';

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

      // Update last check date
      this.lastAlertDate = new Date().toISOString().split('T')[0];
      
    } catch (error) {
      console.error('❌ R.O.M.A.N. FCRA Monitor error:', error);
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
          const daysOverdue = Math.abs(Math.floor((new Date(r.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          return `• **${r.entity_name}** (${r.entity_type}) - OVERDUE by ${daysOverdue} days\n  Tracking: ${r.tracking_number}`;
        }),
      });
    }

    // Warning: Approaching deadlines
    if (report.approaching_deadline.length > 0) {
      const critical = report.approaching_deadline.filter((r: any) => {
        const days = Math.floor((new Date(r.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days < 3;
      });

      const approaching = report.approaching_deadline.filter((r: any) => {
        const days = Math.floor((new Date(r.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days >= 3 && days <= 7;
      });

      if (critical.length > 0) {
        alerts.push({
          level: 'warning',
          message: `⚠️ **URGENT: ${critical.length} Deadline${critical.length === 1 ? '' : 's'} in Next 3 Days**`,
          entities: critical.map((r: any) => {
            const days = Math.floor((new Date(r.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return `• **${r.entity_name}** (${r.entity_type}) - ${days} day${days === 1 ? '' : 's'} remaining\n  Tracking: ${r.tracking_number}`;
          }),
        });
      }

      if (approaching.length > 0) {
        alerts.push({
          level: 'info',
          message: `📅 **${approaching.length} Deadline${approaching.length === 1 ? '' : 's'} Approaching (3-7 Days)**`,
          entities: approaching.map((r: any) => {
            const days = Math.floor((new Date(r.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return `• **${r.entity_name}** (${r.entity_type}) - ${days} days remaining`;
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
          const days = Math.floor((new Date(r.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
