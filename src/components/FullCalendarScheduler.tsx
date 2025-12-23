import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users, MapPin, Clock, Plus, Edit, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/lib/supabaseClient';
import EmployeeSchedulerUI from './EmployeeSchedulerUI';

interface Employee {
  id: string;
  name: string;
  position: string;
  team?: string;
  color: string;
}

interface Schedule {
  id: string;
  employee_id: string;
  date: string;
  jobsite: string;
  team: string;
  hours: number;
  start_time: string;
  end_time: string;
  employee?: Employee;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  schedules: Schedule[];
}

const TEAM_COLORS = {
  'Team A': 'bg-blue-100 border-blue-300 text-blue-800',
  'Team B': 'bg-green-100 border-green-300 text-green-800',
  'Team C': 'bg-purple-100 border-purple-300 text-purple-800',
  'Team D': 'bg-orange-100 border-orange-300 text-orange-800',
  'Unassigned': 'bg-gray-100 border-gray-300 text-gray-800'
};

export default function FullCalendarScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'biweekly'>('monthly');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    team: 'Unassigned'
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

  useEffect(() => {
    loadEmployees();
    loadSchedules();
  }, [currentDate, viewMode]);

  const getStartDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'monthly') {
      date.setDate(1);
      date.setDate(date.getDate() - date.getDay());
    } else if (viewMode === 'weekly') {
      date.setDate(date.getDate() - date.getDay());
    } else if (viewMode === 'biweekly') {
      date.setDate(date.getDate() - date.getDay() - 7);
    }
    return date;
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'monthly') {
      date.setMonth(date.getMonth() + 1, 0);
      date.setDate(date.getDate() + (6 - date.getDay()));
    } else if (viewMode === 'weekly') {
      date.setDate(date.getDate() + 6 - date.getDay());
    } else if (viewMode === 'biweekly') {
      date.setDate(date.getDate() + 13 - date.getDay());
    }
    return date;
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const startDate = getStartDate();
    const endDate = getEndDate();
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const daySchedules = schedules.filter(schedule => 
        schedule.date === current.toISOString().split('T')[0]
      );
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === currentDate.getMonth(),
        schedules: daySchedules
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const addEmployee = async () => {
    if (!newEmployee.name || !newEmployee.position) {
      alert('Please fill all required fields');
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      position: newEmployee.position,
      team: newEmployee.team,
      color: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)]
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', position: '', team: 'Unassigned' });
    setShowEmployeeForm(false);
  };

  const saveSchedule = async () => {
    if (!scheduleForm.employee_id || !scheduleForm.date || !scheduleForm.jobsite) {
      alert('Please fill all required fields');
      return;
    }

    const schedule: Schedule = {
      id: editingSchedule?.id || Date.now().toString(),
      employee_id: scheduleForm.employee_id,
      date: scheduleForm.date,
      jobsite: scheduleForm.jobsite,
      team: scheduleForm.team,
      hours: scheduleForm.hours,
      start_time: scheduleForm.start_time,
      end_time: scheduleForm.end_time
    };

    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === schedule.id ? schedule : s));
    } else {
      setSchedules([...schedules, schedule]);
    }

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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'biweekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 14 : -14));
    }
    setCurrentDate(newDate);
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
    setScheduleForm({
      ...scheduleForm,
      date: date.toISOString().split('T')[0]
    });
    setEditingSchedule(null);
  };

  const calendarDays = generateCalendarDays();
  const filteredEmployees = selectedEmployee 
    ? employees.filter(emp => emp.id === selectedEmployee)
    : employees;
  const loadEmployees = async () => {
    // System ready for real employees - no fake data
    setEmployees([]);
  };

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      const { data } = await supabase.functions.invoke('employee-scheduling-manager', {
        body: { 
          action: 'get_schedule_range',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      
      if (data?.success) {
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      // No fake data - system ready for real schedules
      setSchedules([]);
    }
    setLoading(false);
  };

  return (
    <EmployeeSchedulerUI
      currentDate={currentDate}
      viewMode={viewMode}
      employees={filteredEmployees}
      schedules={schedules}
      selectedEmployee={selectedEmployee}
      editingSchedule={editingSchedule}
      showEmployeeForm={showEmployeeForm}
      loading={loading}
      newEmployee={newEmployee}
      scheduleForm={scheduleForm}
      calendarDays={calendarDays}
      onNavigateMonth={navigateMonth}
      onViewModeChange={setViewMode}
      onEmployeeSelect={setSelectedEmployee}
      onScheduleClick={handleScheduleClick}
      onDayClick={handleDayClick}
      onShowEmployeeForm={setShowEmployeeForm}
      onNewEmployeeChange={(field, value) => 
        setNewEmployee({...newEmployee, [field]: value})
      }
      onScheduleFormChange={(field, value) => 
        setScheduleForm({...scheduleForm, [field]: value})
      }
      onAddEmployee={addEmployee}
      onSaveSchedule={saveSchedule}
      onCancelEdit={() => {
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
      }}
    />
  );
}