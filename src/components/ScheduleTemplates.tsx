import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Copy, Edit, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'biweekly' | 'monthly';
  shifts: TemplateShift[];
  teams: string[];
  createdAt: string;
}

interface TemplateShift {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  jobsite: string;
  team: string;
  employeeCount: number;
}

const ScheduleTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([
    {
      id: '1',
      name: 'Standard Office Cleaning',
      description: 'Monday-Friday office cleaning schedule',
      type: 'weekly',
      shifts: [
        { id: '1', dayOfWeek: 1, startTime: '18:00', endTime: '22:00', jobsite: 'Downtown Office', team: 'Team A', employeeCount: 2 },
        { id: '2', dayOfWeek: 3, startTime: '18:00', endTime: '22:00', jobsite: 'Downtown Office', team: 'Team A', employeeCount: 2 },
        { id: '3', dayOfWeek: 5, startTime: '18:00', endTime: '22:00', jobsite: 'Downtown Office', team: 'Team A', employeeCount: 2 }
      ],
      teams: ['Team A'],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Deep Clean Rotation',
      description: 'Bi-weekly deep cleaning schedule',
      type: 'biweekly',
      shifts: [
        { id: '4', dayOfWeek: 6, startTime: '08:00', endTime: '16:00', jobsite: 'Medical Center', team: 'Team B', employeeCount: 4 }
      ],
      teams: ['Team B'],
      createdAt: '2024-01-10'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<ScheduleTemplate>>({
    name: '',
    description: '',
    type: 'weekly',
    shifts: [],
    teams: []
  });

  const [newShift, setNewShift] = useState<Partial<TemplateShift>>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    jobsite: '',
    team: '',
    employeeCount: 1
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const addShiftToTemplate = () => {
    if (newShift.jobsite && newShift.team) {
      const shift: TemplateShift = {
        id: Date.now().toString(),
        dayOfWeek: newShift.dayOfWeek || 1,
        startTime: newShift.startTime || '09:00',
        endTime: newShift.endTime || '17:00',
        jobsite: newShift.jobsite,
        team: newShift.team,
        employeeCount: newShift.employeeCount || 1
      };

      setNewTemplate(prev => ({
        ...prev,
        shifts: [...(prev.shifts || []), shift]
      }));

      setNewShift({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        jobsite: '',
        team: '',
        employeeCount: 1
      });
    }
  };

  const saveTemplate = () => {
    if (newTemplate.name && newTemplate.description) {
      const template: ScheduleTemplate = {
        id: Date.now().toString(),
        name: newTemplate.name,
        description: newTemplate.description,
        type: newTemplate.type || 'weekly',
        shifts: newTemplate.shifts || [],
        teams: Array.from(new Set(newTemplate.shifts?.map(s => s.team) || [])),
        createdAt: new Date().toISOString().split('T')[0]
      };

      setTemplates([...templates, template]);
      setNewTemplate({ name: '', description: '', type: 'weekly', shifts: [], teams: [] });
      setIsCreating(false);
    }
  };

  const duplicateTemplate = (template: ScheduleTemplate) => {
    const duplicated: ScheduleTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, duplicated]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const applyTemplate = (template: ScheduleTemplate) => {
    // FIX: Removed blocking alert() that crashed the browser
    console.log(`ACTION: Applied template: ${template.name}. Ready for scheduler integration.`);
    // You would integrate a non-blocking toast or modal notification here instead of console.log
  };

  const calculateTotalHours = (shifts: TemplateShift[]) => {
    return shifts.reduce((total, shift) => {
      // Safety check for valid time strings
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      
      // Calculate hours difference. Ensure times are valid before calculation.
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return total; 
      
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + (Math.max(0, hours) * shift.employeeCount); // Only count positive hours
    }, 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schedule Templates</h2>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Template Creation Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Template Name"
                value={newTemplate.name || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
              <Select value={newTemplate.type} onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => 
                setNewTemplate(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Template Description"
              value={newTemplate.description || ''}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
            />

            {/* Add Shifts */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">Add Shifts</h4>
              <div className="grid grid-cols-6 gap-2">
                <Select value={newShift.dayOfWeek?.toString()} onValueChange={(value) => 
                  setNewShift(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={newShift.startTime}
                  onChange={(e) => setNewShift(prev => ({ ...prev, startTime: e.target.value }))}
                />
                <Input
                  type="time"
                  value={newShift.endTime}
                  onChange={(e) => setNewShift(prev => ({ ...prev, endTime: e.target.value }))}
                />
                <Input
                  placeholder="Jobsite"
                  value={newShift.jobsite}
                  onChange={(e) => setNewShift(prev => ({ ...prev, jobsite: e.target.value }))}
                />
                <Input
                  placeholder="Team"
                  value={newShift.team}
                  onChange={(e) => setNewShift(prev => ({ ...prev, team: e.target.value }))}
                />
                <Input
                  type="number"
                  min="1"
                  placeholder="Count"
                  value={newShift.employeeCount}
                  onChange={(e) => setNewShift(prev => ({ ...prev, employeeCount: parseInt(e.target.value) }))}
                />
              </div>
              <Button onClick={addShiftToTemplate} size="sm">Add Shift</Button>
            </div>

            {/* Preview Shifts */}
            {newTemplate.shifts && newTemplate.shifts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Template Shifts</h4>
                {newTemplate.shifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{dayNames[shift.dayOfWeek]}</Badge>
                      <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
                      <span className="text-sm font-medium">{shift.jobsite}</span>
                      <span className="text-sm">{shift.team} ({shift.employeeCount})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setNewTemplate(prev => ({
                        ...prev,
                        shifts: prev.shifts?.filter(s => s.id !== shift.id) || []
                      }))}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={saveTemplate}>Save Template</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <Badge variant="secondary">{template.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-sm font-medium">{template.shifts.length}</div>
                  <div className="text-xs text-gray-500">Shifts</div>
                </div>
                <div>
                  <Users className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <div className="text-sm font-medium">{template.teams.length}</div>
                  <div className="text-xs text-gray-500">Teams</div>
                </div>
                <div>
                  <Clock className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                  <div className="text-sm font-medium">{calculateTotalHours(template.shifts).toFixed(1)}h</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => applyTemplate(template)} className="flex-1">
                  Apply
                </Button>
                <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingTemplate(template)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteTemplate(template.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScheduleTemplates;
