import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users, MapPin, Clock, Plus, Edit, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import CalendarGrid from './CalendarGrid';

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

interface EmployeeSchedulerUIProps {
  currentDate: Date;
  viewMode: 'monthly' | 'weekly' | 'biweekly';
  employees: Employee[];
  schedules: Schedule[];
  selectedEmployee: string;
  editingSchedule: Schedule | null;
  showEmployeeForm: boolean;
  loading: boolean;
  newEmployee: { name: string; position: string; team: string };
  scheduleForm: {
    employee_id: string;
    date: string;
    jobsite: string;
    team: string;
    hours: number;
    start_time: string;
    end_time: string;
  };
  calendarDays: CalendarDay[];
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onViewModeChange: (mode: 'monthly' | 'weekly' | 'biweekly') => void;
  onEmployeeSelect: (employeeId: string) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onDayClick: (date: Date) => void;
  onShowEmployeeForm: (show: boolean) => void;
  onNewEmployeeChange: (field: string, value: string) => void;
  onScheduleFormChange: (field: string, value: string | number) => void;
  onAddEmployee: () => void;
  onSaveSchedule: () => void;
  onCancelEdit: () => void;
}

const TEAM_COLORS = {
  'Team A': 'bg-blue-500',
  'Team B': 'bg-green-500',
  'Team C': 'bg-purple-500',
  'Team D': 'bg-orange-500',
  'Unassigned': 'bg-gray-500'
};

export default function EmployeeSchedulerUI({
  currentDate,
  viewMode,
  employees,
  schedules,
  selectedEmployee,
  editingSchedule,
  showEmployeeForm,
  loading,
  newEmployee,
  scheduleForm,
  calendarDays,
  onNavigateMonth,
  onViewModeChange,
  onEmployeeSelect,
  onScheduleClick,
  onDayClick,
  onShowEmployeeForm,
  onNewEmployeeChange,
  onScheduleFormChange,
  onAddEmployee,
  onSaveSchedule,
  onCancelEdit
}: EmployeeSchedulerUIProps) {
  const formatDateHeader = () => {
    if (viewMode === 'monthly') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'weekly') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    } else {
      const startOfBiweek = new Date(currentDate);
      startOfBiweek.setDate(currentDate.getDate() - currentDate.getDay() - 7);
      const endOfBiweek = new Date(startOfBiweek);
      endOfBiweek.setDate(startOfBiweek.getDate() + 13);
      return `${startOfBiweek.toLocaleDateString()} - ${endOfBiweek.toLocaleDateString()}`;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Users className="h-6 w-6" />
            Employee Scheduler
          </h2>
          
          <div className="space-y-3">
            <Select value={viewMode} onValueChange={onViewModeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly View</SelectItem>
                <SelectItem value="biweekly">Bi-weekly View</SelectItem>
                <SelectItem value="monthly">Monthly View</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedEmployee} onValueChange={onEmployeeSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.team})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Employees ({employees.length})</h3>
            <Button 
              size="sm" 
              onClick={() => onShowEmployeeForm(!showEmployeeForm)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {showEmployeeForm && (
            <Card className="mb-4">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Employee Name"
                  value={newEmployee.name}
                  onChange={(e) => onNewEmployeeChange('name', e.target.value)}
                />
                <Input
                  placeholder="Position"
                  value={newEmployee.position}
                  onChange={(e) => onNewEmployeeChange('position', e.target.value)}
                />
                <Select 
                  value={newEmployee.team} 
                  onValueChange={(value) => onNewEmployeeChange('team', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Team A">Team A</SelectItem>
                    <SelectItem value="Team B">Team B</SelectItem>
                    <SelectItem value="Team C">Team C</SelectItem>
                    <SelectItem value="Team D">Team D</SelectItem>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={onAddEmployee} size="sm" className="flex-1">
                    Add
                  </Button>
                  <Button 
                    onClick={() => onShowEmployeeForm(false)} 
                    size="sm" 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-2">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                  selectedEmployee === employee.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onEmployeeSelect(employee.id === selectedEmployee ? '' : employee.id)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-3 h-3 rounded-full ${TEAM_COLORS[employee.team as keyof typeof TEAM_COLORS] || TEAM_COLORS.Unassigned}`}
                  />
                  <div>
                    <div className="font-medium text-sm">{employee.name}</div>
                    <div className="text-xs text-gray-600">{employee.position}</div>
                    <div className="text-xs text-gray-500">{employee.team}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">{formatDateHeader()}</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={() => onDayClick(new Date())}>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading schedules...</p>
              </div>
            </div>
          ) : (
            <CalendarGrid
              days={calendarDays}
              employees={employees}
              onScheduleClick={onScheduleClick}
              onDayClick={onDayClick}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>

      {/* Schedule Form Modal */}
      {(editingSchedule || scheduleForm.date) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {editingSchedule ? 'Edit Schedule' : 'New Schedule'}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onCancelEdit}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={scheduleForm.employee_id} 
                onValueChange={(value) => onScheduleFormChange('employee_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={scheduleForm.date}
                onChange={(e) => onScheduleFormChange('date', e.target.value)}
              />
              
              <Input
                placeholder="Job Site"
                value={scheduleForm.jobsite}
                onChange={(e) => onScheduleFormChange('jobsite', e.target.value)}
              />
              
              <Select 
                value={scheduleForm.team} 
                onValueChange={(value) => onScheduleFormChange('team', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team A">Team A</SelectItem>
                  <SelectItem value="Team B">Team B</SelectItem>
                  <SelectItem value="Team C">Team C</SelectItem>
                  <SelectItem value="Team D">Team D</SelectItem>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={scheduleForm.start_time}
                  onChange={(e) => onScheduleFormChange('start_time', e.target.value)}
                />
                <Input
                  type="time"
                  value={scheduleForm.end_time}
                  onChange={(e) => onScheduleFormChange('end_time', e.target.value)}
                />
              </div>
              
              <Input
                type="number"
                placeholder="Hours"
                value={scheduleForm.hours}
                onChange={(e) => onScheduleFormChange('hours', parseInt(e.target.value) || 0)}
              />
              
              <div className="flex gap-2">
                <Button onClick={onSaveSchedule} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSchedule ? 'Update' : 'Create'}
                </Button>
                <Button 
                  onClick={onCancelEdit} 
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}