/**
 * EMPLOYEE SCHEDULING SERVICE
 * Comprehensive scheduling system with calendar support, bulk operations, and integrations
 * 
 * Believing Self Creations © 2024 - Sovereign Frequency Enhanced
 */

import { supabase } from '@/lib/supabaseClient';
import { sfLogger } from './sovereignFrequencyLogger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ShiftTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  shift_type: 'regular' | 'split' | 'on_call' | 'overtime';
  start_time: string; // HH:MM format
  end_time: string;
  break_duration_minutes: number;
  days_of_week: number[]; // 0-6, where 0 = Sunday
  regular_hours?: number;
  overtime_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkLocation {
  id: string;
  organization_id: string;
  name: string;
  location_code?: string;
  location_type: 'office' | 'hospital' | 'school' | 'government' | 'industrial';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  site_contact_name?: string;
  site_contact_phone?: string;
  site_contact_email?: string;
  access_instructions?: string;
  required_certifications?: string[];
  special_requirements?: string;
  billing_rate?: number;
  contract_number?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  is_active: boolean;
}

export interface EmployeeSchedule {
  id: string;
  organization_id: string;
  employee_id: string;
  schedule_date: string; // YYYY-MM-DD
  shift_template_id?: string;
  work_location_id?: string;
  start_time?: string;
  end_time?: string;
  break_duration_minutes?: number;
  supervisor_id?: string;
  team_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  schedule_type: 'regular' | 'overtime' | 'on_call' | 'training' | 'off';
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  employee?: any;
  shift_template?: ShiftTemplate;
  work_location?: WorkLocation;
  supervisor?: any;
  team?: Team;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  team_code?: string;
  team_type: 'permanent' | 'temporary' | 'project_based';
  team_lead_id?: string;
  supervisor_id?: string;
  primary_location_id?: string;
  is_active: boolean;
  
  // Joined data
  team_lead?: any;
  supervisor?: any;
  primary_location?: WorkLocation;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  employee_id: string;
  role?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  
  // Joined data
  employee?: any;
}

export interface ScheduleModification {
  id: string;
  organization_id: string;
  employee_id: string;
  schedule_id?: string;
  modification_type: 'time_off' | 'on_call' | 'schedule_swap' | 'overtime' | 'call_out' | 'cancelled';
  modification_date: string;
  swap_employee_id?: string;
  request_reason?: string;
  manager_notes?: string;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  
  // Joined data
  employee?: any;
  swap_employee?: any;
  schedule?: EmployeeSchedule;
}

export interface TrainingAssignment {
  id: string;
  organization_id: string;
  employee_id: string;
  training_name: string;
  training_type: 'onboarding' | 'certification' | 'safety' | 'technical' | 'compliance';
  training_category?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'expired' | 'failed';
  assigned_date: string;
  due_date?: string;
  completion_date?: string;
  expiration_date?: string;
  trainer_name?: string;
  training_location?: string;
  training_hours?: number;
  certificate_number?: string;
  certification_body?: string;
  certificate_url?: string;
  notes?: string;
  
  // Joined data
  employee?: any;
}

export interface ScheduleTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  template_type: 'weekly' | 'biweekly' | 'monthly' | 'rotating';
  cycle_length_days: number;
  is_active: boolean;
  
  // Joined data
  details?: ScheduleTemplateDetail[];
}

export interface ScheduleTemplateDetail {
  id: string;
  template_id: string;
  day_number: number;
  shift_template_id?: string;
  work_location_id?: string;
  start_time?: string;
  end_time?: string;
  schedule_type: 'regular' | 'overtime' | 'on_call' | 'off';
  
  // Joined data
  shift_template?: ShiftTemplate;
  work_location?: WorkLocation;
}

export interface BulkScheduleRequest {
  employee_ids: string[];
  start_date: string;
  end_date: string;
  shift_template_id?: string;
  work_location_id?: string;
  schedule_type?: 'regular' | 'overtime' | 'on_call' | 'training';
  supervisor_id?: string;
  team_id?: string;
  days_of_week?: number[]; // 0-6, where 0 = Sunday
}

// ============================================================================
// SHIFT TEMPLATES
// ============================================================================

export async function createShiftTemplate(data: Partial<ShiftTemplate>) {
  const { data: template, error } = await supabase
    .from('shift_templates')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return template;
}

export async function getShiftTemplates(organizationId: string) {
  const { data, error } = await supabase
    .from('shift_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data as ShiftTemplate[];
}

export async function updateShiftTemplate(id: string, updates: Partial<ShiftTemplate>) {
  const { data, error } = await supabase
    .from('shift_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// WORK LOCATIONS
// ============================================================================

export async function createWorkLocation(data: Partial<WorkLocation>) {
  const { data: location, error } = await supabase
    .from('work_locations')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return location;
}

export async function getWorkLocations(organizationId: string, activeOnly = true) {
  let query = supabase
    .from('work_locations')
    .select('*')
    .eq('organization_id', organizationId);
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data as WorkLocation[];
}

export async function updateWorkLocation(id: string, updates: Partial<WorkLocation>) {
  const { data, error } = await supabase
    .from('work_locations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// EMPLOYEE SCHEDULES
// ============================================================================

export async function createSchedule(data: Partial<EmployeeSchedule>) {
  sfLogger.whenYouLoveSomebody('SCHEDULE_CREATE', 'Allocating employee to schedule', { 
    employeeId: data.employee_id, 
    date: data.schedule_date,
    locationId: data.work_location_id 
  });
  
  const { data: schedule, error } = await supabase
    .from('employee_schedules')
    .insert(data)
    .select(`
      *,
      employee:employees(id, first_name, last_name, email),
      shift_template:shift_templates(*),
      work_location:work_locations(*),
      supervisor:employees!supervisor_id(id, first_name, last_name),
      team:teams(*)
    `)
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('SCHEDULE_CREATE_FAILED', 'Failed to create schedule, attempting recovery', { error: error.message });
    throw error;
  }
  
  sfLogger.thanksForGivingBackMyLove('SCHEDULE_CREATED', 'Schedule successfully created', { scheduleId: schedule.id });
  return schedule as EmployeeSchedule;
}

export async function getSchedules(
  organizationId: string,
  startDate: string,
  endDate: string,
  employeeId?: string
) {
  sfLogger.everyday('SCHEDULE_VIEW', 'Retrieving schedule data for date range', {
    organizationId,
    startDate,
    endDate,
    employeeId,
    scope: employeeId ? 'employee' : 'organization'
  });

  let query = supabase
    .from('employee_schedules')
    .select(`
      *,
      employee:employees(id, first_name, last_name, email, employee_number),
      shift_template:shift_templates(*),
      work_location:work_locations(*),
      supervisor:employees!supervisor_id(id, first_name, last_name),
      team:teams(*)
    `)
    .eq('organization_id', organizationId)
    .gte('schedule_date', startDate)
    .lte('schedule_date', endDate);
  
  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }
  
  const { data, error } = await query.order('schedule_date').order('start_time');
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('SCHEDULE_VIEW_FAILED', 'Failed to retrieve schedules', {
      error: error.message,
      organizationId,
      dateRange: `${startDate} to ${endDate}`
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('SCHEDULE_VIEW_SUCCESS', 'Schedules retrieved successfully', {
    count: data?.length || 0,
    dateRange: `${startDate} to ${endDate}`
  });

  return data as EmployeeSchedule[];
}

export async function updateSchedule(id: string, updates: Partial<EmployeeSchedule>) {
  sfLogger.movingOn('SCHEDULE_UPDATE', 'Updating schedule assignment', {
    scheduleId: id,
    updatedFields: Object.keys(updates)
  });

  const { data, error } = await supabase
    .from('employee_schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      employee:employees(id, first_name, last_name, email),
      shift_template:shift_templates(*),
      work_location:work_locations(*),
      supervisor:employees!supervisor_id(id, first_name, last_name),
      team:teams(*)
    `)
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('SCHEDULE_UPDATE_FAILED', 'Failed to update schedule', {
      error: error.message,
      scheduleId: id
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('SCHEDULE_UPDATED', 'Schedule updated successfully', {
    scheduleId: id,
    employeeId: data.employee_id
  });

  return data;
}

export async function deleteSchedule(id: string) {
  sfLogger.noMoreTears('SCHEDULE_DELETE', 'Removing schedule assignment', {
    scheduleId: id
  });

  const { error } = await supabase
    .from('employee_schedules')
    .delete()
    .eq('id', id);
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('SCHEDULE_DELETE_FAILED', 'Failed to delete schedule', {
      error: error.message,
      scheduleId: id
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('SCHEDULE_DELETED', 'Schedule removed successfully', {
    scheduleId: id
  });
}

// ============================================================================
// BULK SCHEDULING
// ============================================================================

export async function createBulkSchedules(request: BulkScheduleRequest) {
  const { employee_ids, start_date, end_date, days_of_week = [1, 2, 3, 4, 5], ...scheduleData } = request;
  
  // Generate date range
  const start = new Date(start_date);
  const end = new Date(end_date);
  const schedules: Partial<EmployeeSchedule>[] = [];
  
  // Get organization ID from first employee
  const { data: employee } = await supabase
    .from('employees')
    .select('organization_id')
    .eq('id', employee_ids[0])
    .single();
  
  if (!employee) throw new Error('Employee not found');
  
  // Loop through dates
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    
    // Only create schedule if this day is included
    if (days_of_week.includes(dayOfWeek)) {
      // Create schedule for each employee
      for (const employee_id of employee_ids) {
        schedules.push({
          organization_id: employee.organization_id,
          employee_id,
          schedule_date: date.toISOString().split('T')[0],
          ...scheduleData,
          status: 'scheduled',
        });
      }
    }
  }
  
  // Bulk insert
  const { data, error } = await supabase
    .from('employee_schedules')
    .insert(schedules)
    .select();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// TEAMS
// ============================================================================

export async function createTeam(data: Partial<Team>) {
  const { data: team, error } = await supabase
    .from('teams')
    .insert(data)
    .select(`
      *,
      team_lead:employees!team_lead_id(id, first_name, last_name),
      supervisor:employees!supervisor_id(id, first_name, last_name),
      primary_location:work_locations(*)
    `)
    .single();
  
  if (error) throw error;
  return team;
}

export async function getTeams(organizationId: string, activeOnly = true) {
  let query = supabase
    .from('teams')
    .select(`
      *,
      team_lead:employees!team_lead_id(id, first_name, last_name),
      supervisor:employees!supervisor_id(id, first_name, last_name),
      primary_location:work_locations(*),
      members:team_members(*, employee:employees(*))
    `)
    .eq('organization_id', organizationId);
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data as Team[];
}

export async function addTeamMember(teamId: string, employeeId: string, role?: string) {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      employee_id: employeeId,
      role,
      start_date: new Date().toISOString().split('T')[0],
      is_active: true,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeTeamMember(teamMemberId: string) {
  const { error } = await supabase
    .from('team_members')
    .update({
      is_active: false,
      end_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', teamMemberId);
  
  if (error) throw error;
}

// ============================================================================
// SCHEDULE MODIFICATIONS
// ============================================================================

export async function requestScheduleModification(data: Partial<ScheduleModification>) {
  sfLogger.pickUpTheSpecialPhone('MODIFICATION_REQUEST', 'Employee requesting schedule modification', {
    employeeId: data.employee_id,
    modificationType: data.modification_type,
    modificationDate: data.modification_date,
    reason: data.request_reason
  });

  const { data: modification, error } = await supabase
    .from('schedule_modifications')
    .insert({
      ...data,
      status: 'pending',
      requested_at: new Date().toISOString(),
    })
    .select(`
      *,
      employee:employees(id, first_name, last_name),
      swap_employee:employees!swap_employee_id(id, first_name, last_name),
      schedule:employee_schedules(*)
    `)
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('MODIFICATION_REQUEST_FAILED', 'Failed to submit modification request', {
      error: error.message,
      employeeId: data.employee_id
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('MODIFICATION_REQUESTED', 'Modification request submitted successfully', {
    modificationId: modification.id,
    employeeId: data.employee_id,
    type: data.modification_type
  });

  return modification;
}

export async function getPendingModifications(organizationId: string) {
  const { data, error } = await supabase
    .from('schedule_modifications')
    .select(`
      *,
      employee:employees(id, first_name, last_name, employee_number),
      swap_employee:employees!swap_employee_id(id, first_name, last_name),
      schedule:employee_schedules(*)
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .order('requested_at');
  
  if (error) throw error;
  return data as ScheduleModification[];
}

export async function approveModification(id: string, reviewerId: string, notes?: string) {
  sfLogger.whenYouLoveSomebody('MODIFICATION_APPROVE', 'Manager approving schedule modification', {
    modificationId: id,
    reviewerId,
    notes
  });

  const { data, error } = await supabase
    .from('schedule_modifications')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      manager_notes: notes,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('MODIFICATION_APPROVE_FAILED', 'Failed to approve modification', {
      error: error.message,
      modificationId: id
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('MODIFICATION_APPROVED', 'Modification approved successfully', {
    modificationId: id,
    employeeId: data.employee_id
  });

  return data;
}

export async function denyModification(id: string, reviewerId: string, reason: string) {
  sfLogger.howToLose('MODIFICATION_DENY', 'Manager denying schedule modification', {
    modificationId: id,
    reviewerId,
    reason
  });

  const { data, error } = await supabase
    .from('schedule_modifications')
    .update({
      status: 'denied',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      manager_notes: reason,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('MODIFICATION_DENY_FAILED', 'Failed to deny modification', {
      error: error.message,
      modificationId: id
    });
    throw error;
  }

  sfLogger.noMoreTears('MODIFICATION_DENIED', 'Modification denied - moving forward', {
    modificationId: id,
    employeeId: data.employee_id,
    reason
  });

  return data;
}

// ============================================================================
// TRAINING ASSIGNMENTS
// ============================================================================

export async function assignTraining(data: Partial<TrainingAssignment>) {
  sfLogger.allINeedToDoIsTrust('TRAINING_ASSIGN', 'Assigning training to employee', {
    employeeId: data.employee_id,
    trainingName: data.training_name,
    trainingType: data.training_type,
    dueDate: data.due_date
  });

  const { data: training, error } = await supabase
    .from('training_assignments')
    .insert({
      ...data,
      status: 'assigned',
      assigned_date: data.assigned_date || new Date().toISOString().split('T')[0],
    })
    .select(`
      *,
      employee:employees(id, first_name, last_name, employee_number)
    `)
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('TRAINING_ASSIGN_FAILED', 'Failed to assign training', {
      error: error.message,
      employeeId: data.employee_id
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('TRAINING_ASSIGNED', 'Training assigned successfully', {
    trainingId: training.id,
    employeeId: data.employee_id,
    trainingName: data.training_name
  });

  return training;
}

export async function getEmployeeTraining(employeeId: string) {
  const { data, error } = await supabase
    .from('training_assignments')
    .select('*')
    .eq('employee_id', employeeId)
    .order('assigned_date', { ascending: false });
  
  if (error) throw error;
  return data as TrainingAssignment[];
}

export async function completeTraining(
  id: string,
  completionDate: string,
  certificateNumber?: string,
  certificateUrl?: string
) {
  sfLogger.whenYouLoveSomebody('TRAINING_COMPLETE', 'Marking training as completed', {
    trainingId: id,
    completionDate,
    certificateNumber
  });

  const { data, error } = await supabase
    .from('training_assignments')
    .update({
      status: 'completed',
      completion_date: completionDate,
      certificate_number: certificateNumber,
      certificate_url: certificateUrl,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('TRAINING_COMPLETE_FAILED', 'Failed to complete training', {
      error: error.message,
      trainingId: id
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('TRAINING_COMPLETED', 'Training completed successfully', {
    trainingId: id,
    employeeId: data.employee_id,
    completionDate
  });

  return data;
}

export async function checkExpiringTraining(organizationId: string, daysThreshold: number = 30) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  const thresholdDateStr = thresholdDate.toISOString().split('T')[0];

  sfLogger.everyday('TRAINING_EXPIRATION_CHECK', 'Checking for expiring training certifications', {
    organizationId,
    daysThreshold,
    checkDate: thresholdDateStr
  });

  const { data, error } = await supabase
    .from('training_assignments')
    .select(`
      *,
      employee:employees(id, first_name, last_name, employee_number, email)
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .not('expiration_date', 'is', null)
    .lte('expiration_date', thresholdDateStr);

  if (error) {
    sfLogger.helpMeFindMyWayHome('TRAINING_EXPIRATION_CHECK_FAILED', 'Failed to check expiring training', {
      error: error.message,
      organizationId
    });
    throw error;
  }

  if (data && data.length > 0) {
    sfLogger.emergency('TRAINING_EXPIRING', `CRITICAL: ${data.length} training certification(s) expiring within ${daysThreshold} days`, {
      organizationId,
      count: data.length,
      expiringTraining: data.map(t => ({
        employeeId: t.employee_id,
        employeeName: `${t.employee.first_name} ${t.employee.last_name}`,
        trainingName: t.training_name,
        expirationDate: t.expiration_date,
        daysRemaining: Math.ceil((new Date(t.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }))
    });
  } else {
    sfLogger.thanksForGivingBackMyLove('TRAINING_EXPIRATION_CHECK_COMPLETE', 'All training certifications current', {
      organizationId,
      daysThreshold
    });
  }

  return data as TrainingAssignment[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getDaysInMonth(year: number, month: number): number {
  // month is 0-indexed (0 = January, 11 = December)
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthDateRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month, getDaysInMonth(year, month));
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getDayOfWeekName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

export function calculateScheduleHours(startTime: string, endTime: string, breakMinutes: number = 0): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  let endTotalMinutes = endHour * 60 + endMinute;
  
  // Handle overnight shifts
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }
  
  const totalMinutes = endTotalMinutes - startTotalMinutes - breakMinutes;
  return totalMinutes / 60;
}
