/**
 * BULK SCHEDULE MODAL
 * Assign shifts to multiple employees at once across a date range
 */

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
    createBulkSchedules,
    getShiftTemplates,
    getWorkLocations,
    ShiftTemplate,
    WorkLocation,
} from '@/services/schedulingService';
import { Calendar, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BulkScheduleModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  employees: Array<{ id: string; first_name: string; last_name: string; employee_number?: string }>;
  supervisors?: Array<{ id: string; first_name: string; last_name: string }>;
  onSchedulesCreated?: () => void;
}

export default function BulkScheduleModal({
  open,
  onClose,
  organizationId,
  employees,
  supervisors = [],
  onSchedulesCreated,
}: BulkScheduleModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [locations, setLocations] = useState<WorkLocation[]>([]);

  // Form state
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftTemplateId, setShiftTemplateId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [scheduleType, setScheduleType] = useState<'regular' | 'overtime' | 'on_call' | 'training'>('regular');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default

  const daysOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  useEffect(() => {
    if (open) {
      loadData();
      // Set default dates (this week)
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      
      setStartDate(monday.toISOString().split('T')[0]);
      setEndDate(friday.toISOString().split('T')[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function loadData() {
    try {
      const [templatesData, locationsData] = await Promise.all([
        getShiftTemplates(organizationId),
        getWorkLocations(organizationId),
      ]);
      setShiftTemplates(templatesData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  function toggleEmployee(employeeId: string) {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  }

  function selectAllEmployees() {
    setSelectedEmployees(employees.map((e) => e.id));
  }

  function deselectAllEmployees() {
    setSelectedEmployees([]);
  }

  function toggleDayOfWeek(day: number) {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedEmployees.length === 0) {
      toast({
        title: 'No employees selected',
        description: 'Please select at least one employee',
        variant: 'destructive',
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Invalid dates',
        description: 'Please select start and end dates',
        variant: 'destructive',
      });
      return;
    }

    if (daysOfWeek.length === 0) {
      toast({
        title: 'No days selected',
        description: 'Please select at least one day of the week',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      await createBulkSchedules({
        employee_ids: selectedEmployees,
        start_date: startDate,
        end_date: endDate,
        shift_template_id: shiftTemplateId || undefined,
        work_location_id: locationId || undefined,
        supervisor_id: supervisorId || undefined,
        schedule_type: scheduleType,
        days_of_week: daysOfWeek,
      });

      toast({
        title: 'Success',
        description: `Created schedules for ${selectedEmployees.length} employee(s)`,
      });

      onSchedulesCreated?.();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Failed to create schedules:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSelectedEmployees([]);
    setShiftTemplateId('');
    setLocationId('');
    setSupervisorId('');
    setScheduleType('regular');
    setDaysOfWeek([1, 2, 3, 4, 5]);
  }

  function calculateScheduleCount(): number {
    if (!startDate || !endDate || daysOfWeek.length === 0) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      if (daysOfWeek.includes(date.getDay())) {
        count++;
      }
    }

    return count * selectedEmployees.length;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bulk Schedule Assignment
          </DialogTitle>
          <DialogDescription>
            Assign shifts to multiple employees across a date range
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Select Employees ({selectedEmployees.length} selected)
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllEmployees}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={deselectAllEmployees}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
              <div className="grid grid-cols-2 gap-2">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`emp-${employee.id}`}
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={() => toggleEmployee(employee.id)}
                    />
                    <label
                      htmlFor={`emp-${employee.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {employee.first_name} {employee.last_name}
                      {employee.employee_number && (
                        <span className="text-gray-500 ml-1">
                          (#{employee.employee_number})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
              />
            </div>
          </div>

          {/* Days of Week */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeekOptions.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={daysOfWeek.includes(day.value)}
                    onCheckedChange={() => toggleDayOfWeek(day.value)}
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Shift & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shiftTemplate">Shift Template</Label>
              <Select value={shiftTemplateId} onValueChange={setShiftTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific shift</SelectItem>
                  {shiftTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.start_time} - {template.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Work Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific location</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                      {location.location_code && ` (${location.location_code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Type & Supervisor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleType">Schedule Type</Label>
              <Select
                value={scheduleType}
                onValueChange={(v) => setScheduleType(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="overtime">Overtime</SelectItem>
                  <SelectItem value="on_call">On-Call</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {supervisors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor (Optional)</Label>
                <Select value={supervisorId} onValueChange={setSupervisorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No supervisor</SelectItem>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.first_name} {supervisor.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Schedule Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Employees</div>
                <div className="text-lg font-semibold">{selectedEmployees.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Days Selected</div>
                <div className="text-lg font-semibold">{daysOfWeek.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Total Schedules</div>
                <div className="text-lg font-semibold text-blue-600">
                  {calculateScheduleCount()}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedEmployees.length === 0}>
              {loading ? 'Creating Schedules...' : 'Create Schedules'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
