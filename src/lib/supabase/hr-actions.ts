import { supabase } from '../supabase';

export interface Employee {
  id: string;
  user_id?: string;
  organization_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  hourly_rate: number;
  hire_date: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive' | 'terminated';
  created_at: string;
}

export interface TimeEntry {
  id?: string;
  employee_id: string;
  clock_in: string;
  clock_out?: string;
  location?: string;
  status: 'active' | 'pending' | 'approved' | 'corrected';
  total_hours?: number;
  created_at?: string;
}

export interface TimeCorrection {
  employee_id: string;
  original_entry_id: string;
  new_clock_in?: string;
  new_clock_out?: string;
  correction_reason: string;
}

// Employee Management Functions
export async function getEmployees(): Promise<{ success: boolean; employees?: Employee[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      employees: data || []
    };
  } catch (error) {
    console.error('HR Actions - Get Employees Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch employees'
    };
  }
}

export async function createEmployee(employee: Omit<Employee, 'id' | 'created_at'>): Promise<{ success: boolean; employee?: Employee; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      employee: data
    };
  } catch (error) {
    console.error('HR Actions - Create Employee Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create employee'
    };
  }
}

// Time Entry Management Functions
export async function clockIn(employee_id: string, location?: string): Promise<{ success: boolean; time_entry?: TimeEntry; error?: string }> {
  try {
    const timeEntry = {
      employee_id,
      clock_in: new Date().toISOString(),
      location: location || 'Unknown',
      status: 'active' as const
    };

    const { data, error } = await supabase
      .from('time_entries')
      .insert([timeEntry])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      time_entry: data
    };
  } catch (error) {
    console.error('HR Actions - Clock In Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clock in'
    };
  }
}

export async function clockOut(employee_id: string): Promise<{ success: boolean; time_entry?: TimeEntry; error?: string }> {
  try {
    const { data: activeEntry, error: findError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError) throw new Error('No active time entry found');

    const clockOutTime = new Date().toISOString();
    const clockInTime = new Date(activeEntry.clock_in);
    const totalHours = (new Date(clockOutTime).getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    const { data, error } = await supabase
      .from('time_entries')
      .update({ 
        clock_out: clockOutTime,
        total_hours: Math.round(totalHours * 100) / 100,
        status: 'pending'
      })
      .eq('id', activeEntry.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      time_entry: data
    };
  } catch (error) {
    console.error('HR Actions - Clock Out Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clock out'
    };
  }
}

export async function getTimeEntries(employee_id?: string): Promise<{ success: boolean; entries?: TimeEntry[]; error?: string }> {
  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      entries: data || []
    };
  } catch (error) {
    console.error('HR Actions - Get Time Entries Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch time entries'
    };
  }
}

// Time Correction Function
export async function correctEmployeeTime(correction: TimeCorrection): Promise<{ success: boolean; correction_id?: string; error?: string }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required for time corrections');
    }

    // For now, we'll implement a simple correction by updating the time entry
    // In production, this would use the Edge Function for secure corrections
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        clock_in: correction.new_clock_in || undefined,
        clock_out: correction.new_clock_out || undefined,
        status: 'corrected'
      })
      .eq('id', correction.original_entry_id)
      .select('id')
      .single();

    if (error) throw error;

    return {
      success: true,
      correction_id: data.id
    };

  } catch (error) {
    console.error('HR Actions - Time Correction Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during time correction'
    };
  }
}

// Manager Authorization Check
export async function verifyManagerAuthorization(): Promise<{ authorized: boolean; user_id?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { authorized: false };
    }

    // For now, return true for any authenticated user
    // In production, this would check against actual manager roles
    return {
      authorized: true,
      user_id: user.id
    };

  } catch (error) {
    console.error('Manager authorization check failed:', error);
    return { authorized: false };
  }
}
