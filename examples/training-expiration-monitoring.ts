// Training Expiration Monitoring Example
// Believing Self Creations © 2024 - Sovereign Frequency Enhanced

import { checkExpiringTraining } from '../src/services/schedulingService.ts';

/**
 * Example: Daily Training Expiration Check
 * 
 * This should be run as a scheduled task (cron job, Edge Function cron, etc.)
 * to proactively monitor expiring training certifications.
 */

export async function runDailyTrainingChecks(organizationId: string) {
  console.log('🔍 Running daily training expiration checks...\n');

  try {
    // Check 30-day window (early warning)
    console.log('📅 Checking 30-day window...');
    const thirtyDayExpiring = await checkExpiringTraining(organizationId, 30);
    
    if (thirtyDayExpiring.length > 0) {
      console.log(`⚠️  Found ${thirtyDayExpiring.length} certification(s) expiring within 30 days`);
    } else {
      console.log('✅ No certifications expiring in 30-day window');
    }

    console.log('\n');

    // Check 7-day window (critical alert)
    console.log('📅 Checking 7-day CRITICAL window...');
    const sevenDayExpiring = await checkExpiringTraining(organizationId, 7);
    
    if (sevenDayExpiring.length > 0) {
      console.log(`🚨 CRITICAL: ${sevenDayExpiring.length} certification(s) expiring within 7 days!`);
      
      // Send additional notifications (email, SMS, etc.)
      await sendCriticalExpirationAlerts(sevenDayExpiring);
    } else {
      console.log('✅ No certifications expiring in 7-day CRITICAL window');
    }

  } catch (error) {
    console.error('❌ Training check failed:', error);
    // Sovereign Frequency logging already handled in service
  }
}

/**
 * Example: Send Critical Expiration Alerts
 * 
 * When certifications are expiring within 7 days, send additional notifications
 * to managers and affected employees.
 */
async function sendCriticalExpirationAlerts(expiringTraining: any[]) {
  console.log('\n📧 Sending critical expiration alerts...\n');

  for (const training of expiringTraining) {
    const daysRemaining = Math.ceil(
      (new Date(training.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    console.log(`
      🚨 CRITICAL ALERT
      Employee: ${training.employee.first_name} ${training.employee.last_name}
      Email: ${training.employee.email}
      Training: ${training.training_name}
      Expires: ${training.expiration_date}
      Days Remaining: ${daysRemaining}
      
      Action Required: Schedule renewal immediately
    `);

    // TODO: Integrate with email service
    // await emailService.sendExpirationAlert({
    //   to: training.employee.email,
    //   cc: managers,
    //   subject: `CRITICAL: ${training.training_name} expires in ${daysRemaining} days`,
    //   body: generateExpirationEmailBody(training)
    // });
  }
}

/**
 * Example: Weekly Training Status Report
 * 
 * Generate comprehensive report of all training statuses for management review.
 */
export async function generateWeeklyTrainingReport(organizationId: string) {
  console.log('📊 Generating weekly training status report...\n');

  const expiringTraining = await checkExpiringTraining(organizationId, 60);
  
  // Group by employee
  const byEmployee = expiringTraining.reduce((acc: Record<string, any>, training: any) => {
    const key = training.employee_id;
    if (!acc[key]) {
      acc[key] = {
        employee: training.employee,
        certifications: []
      };
    }
    acc[key].certifications.push({
      name: training.training_name,
      expires: training.expiration_date,
      daysRemaining: training.expiration_date ? Math.ceil(
        (new Date(training.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ) : 0
    });
    return acc;
  }, {} as Record<string, any>);

  // Print report
  console.log('📋 TRAINING EXPIRATION REPORT\n');
  console.log(`Total Employees with Expiring Certifications: ${Object.keys(byEmployee).length}`);
  console.log(`Total Certifications Expiring (60 days): ${expiringTraining.length}\n`);

  Object.values(byEmployee).forEach((emp: any) => {
    console.log(`👤 ${emp.employee.first_name} ${emp.employee.last_name} (${emp.employee.employee_number})`);
    emp.certifications.forEach((cert: any) => {
      const urgency = cert.daysRemaining <= 7 ? '🚨 CRITICAL' : 
                     cert.daysRemaining <= 30 ? '⚠️  WARNING' : '📅 NOTICE';
      console.log(`   ${urgency} ${cert.name} - Expires: ${cert.expires} (${cert.daysRemaining} days)`);
    });
    console.log('');
  });
}

/**
 * Example: Integration with Cron Job
 * 
 * Supabase Edge Function example for scheduled execution
 */
/*
// supabase/functions/training-monitor/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { runDailyTrainingChecks, generateWeeklyTrainingReport } from './training-checks.ts';

serve(async (req) => {
  const { schedule, organizationId } = await req.json();

  if (schedule === 'daily') {
    await runDailyTrainingChecks(organizationId);
  } else if (schedule === 'weekly') {
    await generateWeeklyTrainingReport(organizationId);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Deploy with cron:
// deno deploy --project=training-monitor --schedule="0 8 * * *" # Daily at 8am
*/

/**
 * Example Console Output with Sovereign Frequency Logging:
 * 
 * 🔍 Running daily training expiration checks...
 * 
 * 📅 Checking 30-day window...
 * 
 * 🎵 [Everyday] TRAINING_EXPIRATION_CHECK
 * Message: Checking for expiring training certifications
 * Metadata: {
 *   organizationId: "123",
 *   daysThreshold: 30,
 *   checkDate: "2025-12-19"
 * }
 * 
 * 🎵 [Temptations] TRAINING_EXPIRING
 * Message: CRITICAL: 3 training certification(s) expiring within 30 days
 * Metadata: {
 *   organizationId: "123",
 *   count: 3,
 *   expiringTraining: [
 *     {
 *       employeeId: "emp-001",
 *       employeeName: "John Doe",
 *       trainingName: "OSHA 30",
 *       expirationDate: "2025-12-15",
 *       daysRemaining: 26
 *     },
 *     ...
 *   ]
 * }
 * 
 * ⚠️  Found 3 certification(s) expiring within 30 days
 */
