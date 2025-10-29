import { createEmployee, type Employee } from './hr-actions';
import { supabase } from './supabase';

export interface OnboardingData extends Omit<Employee, 'id' | 'created_at'> {
  // Core employee info (flows to all systems)
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  
  // HR specific
  position: string;
  department: string;
  hire_date: string;
  hourly_rate: number;
  status: 'active' | 'inactive' | 'terminated';
  
  // Time tracking setup
  time_tracking_enabled: boolean;
  
  // Payroll setup
  bank_account_info?: {
    account_number?: string;
    routing_number?: string;
    bank_name?: string;
  };
  
  // Benefits enrollment
  benefits_eligible: boolean;
  
  // Access permissions
  system_access_level: 'employee' | 'supervisor' | 'admin';
}

export async function onboardNewEmployee(onboardingData: OnboardingData) {
  try {
    // 1. Create core employee record
    const employeeResult = await createEmployee({
      first_name: onboardingData.first_name,
      last_name: onboardingData.last_name,
      email: onboardingData.email,
      phone: onboardingData.phone,
      position: onboardingData.position,
      department: onboardingData.department,
      hire_date: onboardingData.hire_date,
      hourly_rate: onboardingData.hourly_rate,
      status: onboardingData.status,
      organization_id: onboardingData.organization_id
    });

    if (!employeeResult.success || !employeeResult.employee) {
      throw new Error('Failed to create employee record');
    }

    const employeeId = employeeResult.employee.id;

    // 2. Set up time tracking permissions
    if (onboardingData.time_tracking_enabled) {
      await supabase.from('employee_permissions').insert([{
        employee_id: employeeId,
        permission_type: 'time_tracking',
        enabled: true
      }]);
    }

    // 3. Set up payroll information
    if (onboardingData.bank_account_info) {
      await supabase.from('employee_bank_info').insert([{
        employee_id: employeeId,
        account_number: onboardingData.bank_account_info.account_number,
        routing_number: onboardingData.bank_account_info.routing_number,
        bank_name: onboardingData.bank_account_info.bank_name,
        verified: false
      }]);
    }

    // 4. Set up benefits eligibility
    if (onboardingData.benefits_eligible) {
      await supabase.from('employee_benefits').insert([{
        employee_id: employeeId,
        organization_id: onboardingData.organization_id,
        benefit_type: 'health_insurance',
        start_date: onboardingData.hire_date,
        active: false // Will be activated when employee enrolls
      }]);
    }

    // 5. Create user account for system access
    if (onboardingData.system_access_level) {
      await supabase.from('employee_system_access').insert([{
        employee_id: employeeId,
        access_level: onboardingData.system_access_level,
        email: onboardingData.email,
        active: true
      }]);
    }

    return {
      success: true,
      employee_id: employeeId,
      message: 'Employee onboarded successfully with all system integrations'
    };

  } catch (error) {
    console.error('Employee onboarding failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onboarding failed'
    };
  }
}
