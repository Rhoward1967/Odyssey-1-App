interface NotificationConfig {
  type: 'timesheet_approval' | 'payroll_ready' | 'schedule_update' | 'system_alert';
  recipient: string;
  data: any;
}

export async function sendNotification(config: NotificationConfig): Promise<boolean> {
  try {
    // In a real implementation, this would integrate with email service
    // For now, we'll use browser notifications and console logging
    
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = getNotificationTitle(config.type);
      const body = getNotificationBody(config.type, config.data);
      
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: config.type
      });
    }
    
    console.log(`Notification sent: ${config.type} to ${config.recipient}`, config.data);
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'timesheet_approval':
      return 'Timesheet Requires Approval';
    case 'payroll_ready':
      return 'Payroll Processing Complete';
    case 'schedule_update':
      return 'Schedule Updated';
    case 'system_alert':
      return 'System Alert';
    default:
      return 'ODYSSEY-1 Notification';
  }
}

function getNotificationBody(type: string, data: any): string {
  switch (type) {
    case 'timesheet_approval':
      return `Employee ${data.employeeName} has submitted timesheet for approval.`;
    case 'payroll_ready':
      return `Payroll for ${data.payPeriod} is ready for processing.`;
    case 'schedule_update':
      return `Your schedule has been updated for ${data.date}.`;
    case 'system_alert':
      return data.message || 'System notification';
    default:
      return 'You have a new notification from ODYSSEY-1.';
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
