import React from 'react';
import { MapPin, AlertTriangle, Clock, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface JobAssignment {
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
}

interface Props {
  assignment: JobAssignment;
  onBack: () => void;
}

export default function DetailedJobAssignment({ assignment, onBack }: Props) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Job Assignment Details
            </CardTitle>
            <Button variant="outline" onClick={onBack} className="text-white border-white/20">
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Priority Banner */}
          <div className={`p-4 rounded-lg ${getPriorityColor(assignment.priority)}`}>
            <div className="flex items-center gap-2 text-white font-bold">
              <AlertTriangle className="h-5 w-5" />
              {assignment.priority.toUpperCase()} PRIORITY
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Date & Time</label>
              <div className="text-white font-medium">
                {new Date(assignment.date).toLocaleDateString()}
              </div>
              <div className="text-white">
                {assignment.startTime} - {assignment.endTime}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Client</label>
              <div className="text-white font-medium">{assignment.clientName}</div>
              <div className="text-gray-300">{assignment.serviceType}</div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location & Address
            </label>
            <div className="text-white font-medium">{assignment.location}</div>
            <div className="text-gray-300">{assignment.address}</div>
            <Button className="bg-blue-600 hover:bg-blue-700 mt-2">
              Open in Maps
            </Button>
          </div>

          {/* Hazard Warnings */}
          {assignment.hazardWarnings.length > 0 && (
            <div className="space-y-2">
              <label className="text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                HAZARD WARNINGS - READ CAREFULLY
              </label>
              <div className="space-y-2">
                {assignment.hazardWarnings.map((warning, index) => (
                  <div key={index} className="bg-red-500/20 border border-red-400 p-3 rounded-lg">
                    <div className="text-red-200 font-medium">{warning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equipment Needed */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Required Equipment</label>
            <div className="flex flex-wrap gap-2">
              {assignment.equipmentNeeded.map((item, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-200">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Special Instructions</label>
            <div className="bg-yellow-500/20 border border-yellow-400 p-3 rounded-lg">
              <div className="text-yellow-200">{assignment.specialInstructions}</div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Site Contact
            </label>
            <div className="flex items-center gap-2">
              <div className="text-white font-medium">{assignment.contactNumber}</div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Call Now
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Additional Notes</label>
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-white">{assignment.notes}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Clock In & Start
            </Button>
            <Button variant="outline" className="border-white/20 text-white">
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}