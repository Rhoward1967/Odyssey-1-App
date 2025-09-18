import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, DollarSign, FileText, Settings, Bell, MapPin, Clock, CheckCircle } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'completed';
  nextService: string;
  frequency: string;
  price: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  services: string[];
}

interface Schedule {
  id: string;
  service: string;
  date: string;
  time: string;
  technician: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export default function CustomerPortal() {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Office Deep Cleaning',
      status: 'active',
      nextService: '2024-01-20',
      frequency: 'Weekly',
      price: 450
    },
    {
      id: '2',
      name: 'Carpet Maintenance',
      status: 'scheduled',
      nextService: '2024-01-25',
      frequency: 'Monthly',
      price: 200
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      date: '2024-01-15',
      amount: 450,
      status: 'paid',
      services: ['Office Deep Cleaning']
    },
    {
      id: 'INV-002',
      date: '2024-01-10',
      amount: 650,
      status: 'pending',
      services: ['Office Deep Cleaning', 'Carpet Maintenance']
    }
  ]);

  const [schedule, setSchedule] = useState<Schedule[]>([
    {
      id: '1',
      service: 'Office Deep Cleaning',
      date: '2024-01-20',
      time: '09:00 AM',
      technician: 'John Smith',
      status: 'scheduled'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'paid': case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Portal</h1>
          <p className="text-gray-600 mt-2">Manage your cleaning services and account</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.filter(s => s.status === 'active').length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Service</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Jan 20</div>
                  <p className="text-xs text-muted-foreground">Office Deep Cleaning</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,100</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Office cleaning completed</p>
                      <p className="text-xs text-gray-500">Jan 13, 2024 - 2:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Service scheduled</p>
                      <p className="text-xs text-gray-500">Jan 20, 2024 - 9:00 AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {schedule.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.service}</p>
                        <p className="text-xs text-gray-500">{item.date} at {item.time}</p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Frequency:</span>
                        <span className="font-medium">{service.frequency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Next Service:</span>
                        <span className="font-medium">{service.nextService}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span className="font-medium">${service.price}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Modify
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.service}</span>
                          <span className="text-sm text-gray-500">{item.technician}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{item.date}</div>
                          <div className="text-sm text-gray-500">{item.time}</div>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-gray-500">{invoice.date}</div>
                        <div className="text-sm text-gray-500">
                          {invoice.services.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">${invoice.amount}</div>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <input className="w-full mt-1 p-2 border rounded-md" defaultValue="ABC Corporation" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Email</label>
                    <input className="w-full mt-1 p-2 border rounded-md" defaultValue="contact@abc.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <input className="w-full mt-1 p-2 border rounded-md" defaultValue="(555) 123-4567" />
                  </div>
                  <Button>Update Information</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Reminders</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Invoice Notifications</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Schedule Changes</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}