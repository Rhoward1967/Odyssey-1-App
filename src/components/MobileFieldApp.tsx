import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Clock, CheckCircle, Camera, MessageSquare, 
  Navigation, Phone, AlertTriangle, FileText, User
} from 'lucide-react';

interface Job {
  id: string;
  client: string;
  address: string;
  service: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: string;
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  required: boolean;
}

export default function MobileFieldApp() {
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      client: 'ABC Corporation',
      address: '123 Business Ave, Suite 100',
      service: 'Office Deep Cleaning',
      time: '09:00 AM',
      status: 'pending',
      priority: 'high',
      estimatedDuration: '3 hours'
    },
    {
      id: '2',
      client: 'Medical Center',
      address: '456 Health St',
      service: 'Medical Facility Cleaning',
      time: '02:00 PM',
      status: 'pending',
      priority: 'medium',
      estimatedDuration: '2 hours'
    }
  ]);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', task: 'Check-in at location', completed: false, required: true },
    { id: '2', task: 'Verify equipment and supplies', completed: false, required: true },
    { id: '3', task: 'Take before photos', completed: false, required: false },
    { id: '4', task: 'Complete cleaning tasks', completed: false, required: true },
    { id: '5', task: 'Take after photos', completed: false, required: false },
    { id: '6', task: 'Get client signature', completed: false, required: true }
  ]);

  const startJob = (job: Job) => {
    setActiveJob(job);
    setJobs(jobs.map(j => 
      j.id === job.id ? { ...j, status: 'in-progress' } : j
    ));
  };

  const completeJob = () => {
    if (activeJob) {
      setJobs(jobs.map(j => 
        j.id === activeJob.id ? { ...j, status: 'completed' } : j
      ));
      setActiveJob(null);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-3 md:p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold">Field App</h1>
            <p className="text-sm opacity-90">Technician Portal</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500 text-xs">Online</Badge>
            <User className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4">
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 text-xs h-auto">
            <TabsTrigger value="jobs" className="p-2 md:p-3">
              <span className="hidden sm:inline">Jobs</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="p-2 md:p-3">
              <span className="hidden sm:inline">Active</span>
              <span className="sm:hidden">Active</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="p-2 md:p-3">
              <span className="hidden sm:inline">Tasks</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="p-2 md:p-3">
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{job.client}</CardTitle>
                      <div className="flex space-x-2">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{job.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{job.time} • {job.estimatedDuration}</span>
                    </div>
                    <div className="text-sm font-medium">{job.service}</div>
                    
                    <div className="flex space-x-2 pt-2">
                      {job.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => startJob(job)}
                          className="flex-1"
                        >
                          Start Job
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        <Navigation className="h-4 w-4 mr-1" />
                        Navigate
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeJob ? (
              <div className="space-y-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">
                      Active Job: {activeJob.client}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>{activeJob.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Started at {activeJob.time}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline">
                        <Camera className="h-4 w-4 mr-1" />
                        Photo
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Note
                      </Button>
                      <Button size="sm" variant="outline">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Issue
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>

                    <Button 
                      onClick={completeJob}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Job
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Job Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {checklist.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(item.id)}
                            className="rounded"
                          />
                          <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                            {item.task}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active job</p>
                  <p className="text-sm text-gray-400">Start a job to see details here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Checklist</CardTitle>
                <p className="text-sm text-gray-600">
                  Complete all required tasks before finishing
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.task}
                        </span>
                        {item.required && (
                          <Badge className="ml-2 text-xs bg-red-100 text-red-800">
                            Required
                          </Badge>
                        )}
                      </div>
                      {item.completed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">3</div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2</div>
                    <div className="text-sm text-blue-600">Pending</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Hours Today</span>
                    <span className="font-bold">6.5 hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Break Time</span>
                    <span className="font-bold">0.5 hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Travel Time</span>
                    <span className="font-bold">1.2 hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}