// Employee Scheduling - Sovereign Frequency Enhanced
// Believing Self Creations © 2024

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
    checkExpiringTraining,
    createSchedule,
    getSchedules,
    updateSchedule,
    type EmployeeSchedule
} from '@/services/schedulingService';
import React, { useEffect, useState } from 'react';
import EmployeeSchedulerUI from './EmployeeSchedulerUI';

interface Employee {
  id: string;
  name: string;
  position: string;
  team?: string;
  color: string;
}

// Adapter interface for UI compatibility
interface Schedule {
  id: string;
  employee_id: string;
  date: string;  // schedule_date from DB
  jobsite: string; // work_location_id from DB
  team: string;    // team_id from DB
  hours: number;   // calculated from start_time/end_time
  start_time: string;
  end_time: string;
  employee?: Employee;
}

// Helper to convert DB schedule to UI schedule
function toUISchedule(dbSchedule: EmployeeSchedule): Schedule {
  const start = dbSchedule.start_time || '09:00';
  const end = dbSchedule.end_time || '17:00';
  const hours = calculateHours(start, end);
  
  return {
    id: dbSchedule.id,
    employee_id: dbSchedule.employee_id,
    date: dbSchedule.schedule_date,
    jobsite: dbSchedule.work_location_id || '',
    team: dbSchedule.team_id || '',
    hours,
    start_time: start,
    end_time: end,
    employee: dbSchedule.employee
  };
}

function calculateHours(start: string, end: string): number {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  return (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  schedules: Schedule[];
}

export default function EmployeeScheduling() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'biweekly'>('monthly');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    team: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    employee_id: '',
    date: '',
    jobsite: '',
    team: '',
    hours: 8,
    start_time: '09:00',
    end_time: '17:00'
  });

  // Get user's organization
  useEffect(() => {
    const getOrganization = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userOrg } = await supabase
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();
        
        if (userOrg) {
          setOrganizationId(userOrg.organization_id.toString());
        }
      }
    };
    getOrganization();
  }, []);

  // Load employees, schedules, and check training
  useEffect(() => {
    if (!organizationId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load employees
        const { data: employeeData } = await supabase
          .from('employees')
          .select('*')
          .eq('organization_id', organizationId);

        if (employeeData) {
          const employeeColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
          setEmployees(employeeData.map((emp, idx) => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            position: emp.job_title || 'Employee',
            team: emp.team_id || 'Unassigned',
            color: employeeColors[idx % employeeColors.length]
          })));
        }

        // Load schedules for current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const schedulesData = await getSchedules(
          organizationId,
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        );

        setSchedules(schedulesData.map(toUISchedule));

        // Check for expiring training (this will trigger Sovereign Frequency logging)
        await checkExpiringTraining(organizationId, 30);

      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load scheduling data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [organizationId, currentDate, toast]);

  // Generate calendar days
  const calendarDays: CalendarDay[] = React.useMemo(() => {
    const days: CalendarDay[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from previous month if needed
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDay);
      date.setDate(date.getDate() + i);
      
      const daySchedules = schedules.filter(s => 
        new Date(s.date).toDateString() === date.toDateString() &&
        (selectedEmployee === 'all' || s.employee_id === selectedEmployee)
      );

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        schedules: daySchedules
      });
    }
    
    return days;
  }, [currentDate, schedules, selectedEmployee]);

  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      employee_id: schedule.employee_id,
      date: schedule.date,
      jobsite: schedule.jobsite,
      team: schedule.team,
      hours: schedule.hours,
      start_time: schedule.start_time,
      end_time: schedule.end_time
    });
  };

  const handleDayClick = (date: Date) => {
    setEditingSchedule(null);
    setScheduleForm({
      ...scheduleForm,
      date: date.toISOString().split('T')[0]
    });
  };

  const handleNewEmployeeChange = (field: string, value: string) => {
    setNewEmployee(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleFormChange = (field: string, value: string | number) => {
    setScheduleForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEmployee = async () => {
    if (!organizationId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('employees')
        .insert({
          organization_id: parseInt(organizationId),
          first_name: newEmployee.name.split(' ')[0],
          last_name: newEmployee.name.split(' ').slice(1).join(' ') || '',
          job_title: newEmployee.position,
          employment_status: 'active',
          hire_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee added successfully'
      });

      // Reload employees
      const { data: employeeData } = await supabase
        .from('employees')
        .select('*')
        .eq('organization_id', organizationId);

      if (employeeData) {
        const employeeColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
        setEmployees(employeeData.map((emp, idx) => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          position: emp.job_title || 'Employee',
          team: emp.team_id || 'Unassigned',
          color: employeeColors[idx % employeeColors.length]
        })));
      }

      setShowEmployeeForm(false);
      setNewEmployee({ name: '', position: '', team: '' });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to add employee',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSchedule = async () => {
    if (!organizationId) return;

    try {
      if (editingSchedule) {
        // Update existing schedule - convert UI fields to DB fields
        await updateSchedule(editingSchedule.id, {
          employee_id: scheduleForm.employee_id,
          schedule_date: scheduleForm.date,
          work_location_id: scheduleForm.jobsite,
          team_id: scheduleForm.team || undefined,
          start_time: scheduleForm.start_time,
          end_time: scheduleForm.end_time,
          status: 'scheduled',
          schedule_type: 'regular'
        });
        toast({
          title: 'Success',
          description: 'Schedule updated successfully'
        });
      } else {
        // Create new schedule - convert UI fields to DB fields
        await createSchedule({
          organization_id: organizationId,
          employee_id: scheduleForm.employee_id,
          schedule_date: scheduleForm.date,
          work_location_id: scheduleForm.jobsite || undefined,
          team_id: scheduleForm.team || undefined,
          start_time: scheduleForm.start_time,
          end_time: scheduleForm.end_time,
          status: 'scheduled',
          schedule_type: 'regular'
        });
        toast({
          title: 'Success',
          description: 'Schedule created successfully'
        });
      }

      // Reload schedules
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const schedulesData = await getSchedules(
        organizationId,
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      );

      setSchedules(schedulesData.map(toUISchedule));
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save schedule',
        variant: 'destructive'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setScheduleForm({
      employee_id: '',
      date: '',
      jobsite: '',
      team: '',
      hours: 8,
      start_time: '09:00',
      end_time: '17:00'
    });
  };

  if (!organizationId) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Please log in to access scheduling</p>
      </div>
    );
  }

  return (
    <EmployeeSchedulerUI
      currentDate={currentDate}
      viewMode={viewMode}
      employees={employees}
      schedules={schedules}
      selectedEmployee={selectedEmployee}
      editingSchedule={editingSchedule}
      showEmployeeForm={showEmployeeForm}
      loading={loading}
      newEmployee={newEmployee}
      scheduleForm={scheduleForm}
      calendarDays={calendarDays}
      onNavigateMonth={handleNavigateMonth}
      onViewModeChange={setViewMode}
      onEmployeeSelect={setSelectedEmployee}
      onScheduleClick={handleScheduleClick}
      onDayClick={handleDayClick}
      onShowEmployeeForm={setShowEmployeeForm}
      onNewEmployeeChange={handleNewEmployeeChange}
      onScheduleFormChange={handleScheduleFormChange}
      onAddEmployee={handleAddEmployee}
      onSaveSchedule={handleSaveSchedule}
      onCancelEdit={handleCancelEdit}
    />
  );
}
