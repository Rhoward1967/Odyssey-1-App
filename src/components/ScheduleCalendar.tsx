/**
 * EMPLOYEE SCHEDULE CALENDAR COMPONENT
 * Robust calendar with 28/29/30/31 day month support
 * Drag-and-drop scheduling, bulk operations, and single employee modifications
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
    EmployeeSchedule,
    getMonthDateRange,
    getSchedules,
    getShiftTemplates,
    getWorkLocations,
    ShiftTemplate,
    WorkLocation,
} from '@/services/schedulingService';
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import BulkScheduleModal from './BulkScheduleModal';

interface ScheduleCalendarProps {
  organizationId: string;
  employeeId?: string; // If provided, show only this employee's schedule
}

export default function ScheduleCalendar({ organizationId, employeeId }: ScheduleCalendarProps) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const dateRange = getMonthDateRange(year, month);

      const [schedulesData, templatesData, locationsData, employeesData, supervisorsData] = await Promise.all([
        getSchedules(organizationId, dateRange.start, dateRange.end, employeeId),
        getShiftTemplates(organizationId),
        getWorkLocations(organizationId),
        loadEmployees(),
        loadSupervisors(),
      ]);

      setSchedules(schedulesData);
      setShiftTemplates(templatesData);
      setLocations(locationsData);
      setEmployees(employeesData);
      setSupervisors(supervisorsData);
    } catch (error) {
      console.error('Failed to load schedule data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schedule data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  async function loadEmployees() {
    const { data } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_number')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('last_name');
    return data || [];
  }

  async function loadSupervisors() {
    const { data } = await supabase
      .from('employees')
      .select('id, first_name, last_name')
      .eq('organization_id', organizationId)
      .order('last_name');
    return data || [];
  }

  useEffect(() => {
    loadScheduleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, currentDate, employeeId]);

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getSchedulesForDate(date: string): EmployeeSchedule[] {
    return schedules.filter((s) => s.schedule_date === date);
  }

  function renderCalendarGrid() {
    const days: JSX.Element[] = [];

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach((day) => {
      days.push(
        <div key={`header-${day}`} className="text-center font-semibold text-gray-600 py-2">
          {day}
        </div>
      );
    });

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border border-gray-200 bg-gray-50" />);
    }

    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const daySchedules = getSchedulesForDate(dateString);
      const isToday =
        date.toDateString() === new Date().toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      days.push(
        <div
          key={`day-${day}`}
          className={`border border-gray-200 min-h-[120px] p-2 ${
            isToday ? 'bg-blue-50 border-blue-400' : isWeekend ? 'bg-gray-50' : 'bg-white'
          } hover:bg-gray-50 transition-colors cursor-pointer`}
          onClick={() => handleDateClick(dateString)}
        >
          <div
            className={`text-sm font-semibold mb-1 ${
              isToday ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {daySchedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`text-xs p-1 rounded ${getScheduleColor(schedule.schedule_type)} truncate`}
                title={`${schedule.employee?.first_name} ${schedule.employee?.last_name} - ${schedule.shift_template?.name || 'Custom'}`}
              >
                {employeeId ? (
                  <span>
                    {schedule.shift_template?.name || schedule.start_time || 'Scheduled'}
                  </span>
                ) : (
                  <span>
                    {schedule.employee?.first_name?.charAt(0)}.{' '}
                    {schedule.employee?.last_name}
                  </span>
                )}
              </div>
            ))}
            {daySchedules.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{daySchedules.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  }

  function getScheduleColor(type: string): string {
    switch (type) {
      case 'regular':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'overtime':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'on_call':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'training':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'off':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  }

  function handleDateClick(date: string) {
    // TODO: Open schedule detail/creation modal
    console.log('Date clicked:', date);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading schedule...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">{monthName}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>

              {!employeeId && (
                <Button onClick={() => setBulkModalOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Schedule
                </Button>
              )}

              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bulk Schedule Modal */}
      {!employeeId && (
        <BulkScheduleModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          organizationId={organizationId}
          employees={employees}
          supervisors={supervisors}
          onSchedulesCreated={() => {
            setBulkModalOpen(false);
            loadScheduleData();
          }}
        />
      )}

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-0">
            {renderCalendarGrid()}
          </div>

          {/* Calendar Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                Days in {currentDate.toLocaleDateString('en-US', { month: 'long' })}: {daysInMonth}
              </span>
              <span>Total Schedules: {schedules.length}</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
                <span className="text-xs">Regular</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300" />
                <span className="text-xs">Overtime</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
                <span className="text-xs">On-Call</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300" />
                <span className="text-xs">Training</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      {!employeeId && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Shifts</div>
              <div className="text-2xl font-bold">{schedules.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Regular Hours</div>
              <div className="text-2xl font-bold">
                {schedules
                  .filter((s) => s.schedule_type === 'regular')
                  .reduce((total, s) => {
                    const hours =
                      s.shift_template?.regular_hours ||
                      (s.start_time && s.end_time ? 8 : 0);
                    return total + hours;
                  }, 0)
                  .toFixed(0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Overtime Shifts</div>
              <div className="text-2xl font-bold">
                {schedules.filter((s) => s.schedule_type === 'overtime').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Locations</div>
              <div className="text-2xl font-bold">{locations.length}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
