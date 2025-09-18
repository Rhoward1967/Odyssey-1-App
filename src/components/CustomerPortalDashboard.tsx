import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, CreditCard, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'in-progress' | 'cancelled';
  technician: string;
  notes?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  services: string[];
}

export default function CustomerPortalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const upcomingServices: Service[] = [
    {
      id: '1',
      name: 'Office Deep Clean',
      date: '2024-01-20',
      time: '09:00 AM',
      status: 'scheduled',
      technician: 'Sarah Johnson'
    },
    {
      id: '2',
      name: 'Restroom Maintenance',
      date: '2024-01-22',
      time: '02:00 PM',
      status: 'scheduled',
      technician: 'Mike Chen'
    }
  ];

  const recentInvoices: Invoice[] = [
    {
      id: 'INV-001',
      date: '2024-01-15',
      amount: 450.00,
      status: 'paid',
      services: ['Office Cleaning', 'Carpet Cleaning']
    },
    {
      id: 'INV-002',
      date: '2024-01-10',
      amount: 320.00,
      status: 'pending',
      services: ['Restroom Cleaning', 'Window Cleaning']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Portal</h2>
          <p className="text-gray-600 mt-1">Manage your cleaning services and account</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Next Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Jan 20</div>
                <div className="text-sm text-gray-600">Office Deep Clean</div>
                <div className="text-sm text-gray-500">9:00 AM</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$0.00</div>
                <div className="text-sm text-gray-600">All invoices paid</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Service Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-sm text-gray-600">Excellent service</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">{service.date} at {service.time}</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-gray-600">{invoice.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...upcomingServices, 
                  { id: '3', name: 'Carpet Deep Clean', date: '2024-01-15', time: '10:00 AM', status: 'completed' as const, technician: 'Lisa Wong', notes: 'Excellent work, very thorough' },
                  { id: '4', name: 'Window Cleaning', date: '2024-01-10', time: '01:00 PM', status: 'completed' as const, technician: 'David Kim' }
                ].map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.date} at {service.time}</div>
                        <div className="text-sm text-gray-500">Technician: {service.technician}</div>
                        {service.notes && (
                          <div className="text-sm text-gray-600 mt-1 italic">"{service.notes}"</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      {service.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          Rate Service
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Payment Method</h3>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium">•••• •••• •••• 4242</div>
                        <div className="text-sm text-gray-600">Expires 12/25</div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Update Payment Method
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Billing Address</h3>
                  <div className="p-4 border rounded-lg text-sm">
                    <div>123 Business Ave</div>
                    <div>Suite 100</div>
                    <div>City, ST 12345</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Update Address
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-sm text-gray-600">{invoice.date}</div>
                      <div className="text-sm text-gray-500">
                        Services: {invoice.services.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages & Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-6">
                  Need help? Contact our support team for assistance with your account or services.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Start New Conversation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}