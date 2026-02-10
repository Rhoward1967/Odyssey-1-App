// ═══════════════════════════════════════════════════════════════════
// TRUST DISTRIBUTION SCHEDULER
// Created: February 8, 2026
// Purpose: Daily cron job to check for quarterly distribution dates
// Schedule: Runs daily at 9:00 AM EST
// Notifications: Discord webhook for R.O.M.A.N. alerts
// ═══════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface DistributionCheckResult {
  date: string;
  action: 'AUTO_GENERATED' | 'REMINDER_CHECK';
  distribution_id: string | null;
  reminders: Array<{
    reminder_type: string;
    distribution_date: string;
    days_until: number;
    message: string;
  }>;
  message: string;
}

serve(async (req) => {
  try {
    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Run daily distribution check
    const { data: checkResult, error: checkError } = await supabase.rpc(
      'daily_distribution_check'
    );

    if (checkError) {
      console.error('Distribution check error:', checkError);
      throw checkError;
    }

    const result = checkResult as DistributionCheckResult;
    console.log('Distribution check completed:', result);

    // Send Discord notifications if there are reminders or auto-generation
    if (DISCORD_WEBHOOK_URL && (result.reminders.length > 0 || result.distribution_id)) {
      await sendDiscordNotification(supabase, result);
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        ...result,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Trust distribution scheduler error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function sendDiscordNotification(
  supabase: any,
  result: DistributionCheckResult
) {
  const embeds = [];

  // If distribution was auto-generated, create notification
  if (result.distribution_id) {
    const { data: notification } = await supabase.rpc(
      'build_distribution_notification',
      { p_distribution_id: result.distribution_id }
    );

    if (notification && !notification.error) {
      embeds.push({
        title: `🎯 ${notification.title}`,
        description: notification.message,
        color: 0x00ff00, // Green
        fields: [
          {
            name: 'Beneficiary',
            value: notification.beneficiary,
            inline: true,
          },
          {
            name: 'Distribution Amount',
            value: `$${notification.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            inline: true,
          },
          {
            name: 'Status',
            value: notification.status,
            inline: true,
          },
          {
            name: 'Trust Income',
            value: `$${notification.trust_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            inline: true,
          },
          {
            name: 'Distribution Rate',
            value: `${notification.distribution_percentage}%`,
            inline: true,
          },
          {
            name: 'Distribution Date',
            value: new Date(notification.distribution_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            inline: true,
          },
        ],
        footer: {
          text: `Distribution ID: ${notification.distribution_id}`,
        },
        timestamp: new Date().toISOString(),
      });

      // Add action buttons if available
      if (notification.actions && notification.actions[0]) {
        embeds[0].fields.push({
          name: 'Next Action',
          value: `\`\`\`sql\n${notification.actions[0].sql}\n\`\`\``,
          inline: false,
        });
      }
    }
  }

  // Add reminder notifications
  for (const reminder of result.reminders) {
    const color =
      reminder.reminder_type === 'OVERDUE'
        ? 0xff0000 // Red
        : reminder.reminder_type === 'GENERATE_NOW'
        ? 0xffa500 // Orange
        : 0xffff00; // Yellow

    const emoji =
      reminder.reminder_type === 'OVERDUE'
        ? '🚨'
        : reminder.reminder_type === 'GENERATE_NOW'
        ? '🎯'
        : '📅';

    embeds.push({
      title: `${emoji} Trust Distribution Reminder`,
      description: reminder.message,
      color: color,
      fields: [
        {
          name: 'Distribution Date',
          value: new Date(reminder.distribution_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          inline: true,
        },
        {
          name: 'Days Until/Past',
          value: Math.abs(reminder.days_until).toString(),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    });
  }

  // Send to Discord
  if (embeds.length > 0) {
    await fetch(DISCORD_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'R.O.M.A.N. Fiduciary Officer',
        avatar_url: 'https://i.imgur.com/4M34hi2.png', // Optional: R.O.M.A.N. avatar
        embeds: embeds,
      }),
    });
  }
}
