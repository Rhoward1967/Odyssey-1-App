import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, AlertTriangle, Clock, Phone, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';

interface Assignment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  clientName: string;
  serviceType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  hazardWarnings: string[];
  specialInstructions: string;
  equipmentNeeded: string[];
  contactNumber: string;
  notes: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export default function MobileEmployeePortal() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [currentEmployee] = useState({ id: '1', name: 'John Doe' }); // Would come from auth

  useEffect(() => {
    loadAssignments();
    
    // Real-time subscription for schedule changes
    const subscription = supabase
      .channel('employee_assignments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'employee_assignments',
        filter: `employee_id=eq.${currentEmployee.id}`
      }, (payload) => {
        console.log('Schedule updated!', payload);
        loadAssignments();
        // Show notification
        if ('Notification' in window) {
          new Notification('Schedule Updated', {
            body: 'Your work schedule has been modified. Check your assignments.',
            icon: '/icon-192x192.png'
          });
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [currentEmployee.id]);

  const loadAssignments = async () => {
    // Mock data - would come from Supabase
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '16:00',
        location: 'Federal Building Complex',
        address: '123 Government Ave, Washington DC 20001',
        clientName: 'GSA - General Services Administration',
        serviceType: 'Deep Clean & Sanitization',
        priority: 'high',
        hazardWarnings: ['Asbestos present in basement', 'Chemical storage area - Level 3'],
        specialInstructions: 'Security clearance required. Badge in at main desk. No photos allowed.',
        equipmentNeeded: ['HEPA vacuum', 'Chemical suits', 'Respirators', 'Biohazard bags'],
        contactNumber: '(202) 555-0123',
        notes: 'Emergency cleaning after incident. Full PPE mandatory. Report to Site Supervisor immediately.',
        status: 'scheduled'
      }
    ];
    setAssignments(mockAssignments);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return assignments.filter(a => a.date === dateStr);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  if (selectedAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-3 md:p-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <FileText className="h-5 w-5" />
                Assignment Details
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setSelectedAssignment(null)}
                className="text-white border-white/20 self-start md:self-center"
              >
                Back to Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
            {/* Priority Banner */}
            <div className={`p-3 md:p-4 rounded-lg ${getPriorityColor(selectedAssignment.priority)}`}>
              <div className="flex items-center gap-2 text-white font-bold text-sm md:text-base">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                {selectedAssignment.priority.toUpperCase()} PRIORITY
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Date & Time</label>
                <div className="text-white font-medium text-sm md:text-base">
                  {new Date(selectedAssignment.date).toLocaleDateString()}
                </div>
                <div className="text-white text-sm md:text-base">
                  {selectedAssignment.startTime} - {selectedAssignment.endTime}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Client</label>
                <div className="text-white font-medium text-sm md:text-base">{selectedAssignment.clientName}</div>
                <div className="text-gray-300 text-sm md:text-base">{selectedAssignment.serviceType}</div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location & Address
              </label>
              <div className="text-white font-medium text-sm md:text-base">{selectedAssignment.location}</div>
              <div className="text-gray-300 text-sm md:text-base break-words">{selectedAssignment.address}</div>
              <Button className="bg-blue-600 hover:bg-blue-700 mt-2 w-full md:w-auto">
                Open in Maps
              </Button>
            </div>

            {/* Hazard Warnings */}
            {selectedAssignment.hazardWarnings.length > 0 && (
              <div className="space-y-2">
                <label className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  HAZARD WARNINGS
                </label>
                <div className="space-y-2">
                  {selectedAssignment.hazardWarnings.map((warning, index) => (
                    <div key={index} className="bg-red-500/20 border border-red-400 p-3 rounded-lg">
                      <div className="text-red-200 font-medium text-sm md:text-base">{warning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Needed */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Equipment Required</label>
              <div className="flex flex-wrap gap-2">
                {selectedAssignment.equipmentNeeded.map((item, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-200 text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Special Instructions</label>
              <div className="bg-yellow-500/20 border border-yellow-400 p-3 rounded-lg">
                <div className="text-yellow-200 text-sm md:text-base">{selectedAssignment.specialInstructions}</div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency Contact
              </label>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                <div className="text-white font-medium text-sm md:text-base">{selectedAssignment.contactNumber}</div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                  Call Now
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Additional Notes</label>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-white text-sm md:text-base">{selectedAssignment.notes}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 md:flex-row pt-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Start Assignment
              </Button>
              <Button variant="outline" className="border-white/20 text-white flex-1 md:flex-initial">
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-3 md:p-4">
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
            <Calendar className="h-5 w-5" />
            My Work Schedule - {currentEmployee.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-white font-medium p-1 md:p-2 text-xs md:text-sm">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
            
            {getDaysInMonth(selectedDate).map((day, index) => {
              const dayAssignments = day ? getAssignmentsForDate(day) : [];
              return (
                <div key={index} className={`min-h-[60px] md:min-h-[80px] border border-white/10 rounded-lg p-1 ${
                  day ? 'bg-white/5' : ''
                }`}>
                  {day && (
                    <>
                      <div className="text-white text-xs md:text-sm font-medium mb-1">
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayAssignments.slice(0, window.innerWidth < 768 ? 1 : 2).map(assignment => (
                          <div
                            key={assignment.id}
                            onClick={() => setSelectedAssignment(assignment)}
                            className={`text-xs p-0.5 md:p-1 rounded cursor-pointer border-l-2 ${
                              assignment.priority === 'critical' ? 'bg-red-500/20 border-red-400' :
                              assignment.priority === 'high' ? 'bg-orange-500/20 border-orange-400' :
                              assignment.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-400' :
                              'bg-green-500/20 border-green-400'
                            }`}
                          >
                            <div className="text-white font-medium truncate">
                              {assignment.startTime}
                            </div>
                            <div className="text-gray-300 truncate text-xs">
                              {assignment.location}
                            </div>
                            {assignment.hazardWarnings.length > 0 && (
                              <AlertTriangle className="h-2 w-2 md:h-3 md:w-3 text-red-400 mt-1" />
                            )}
                          </div>
                        ))}
                        {dayAssignments.length > (window.innerWidth < 768 ? 1 : 2) && (
                          <div className="text-xs text-gray-400">+{dayAssignments.length - (window.innerWidth < 768 ? 1 : 2)}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}