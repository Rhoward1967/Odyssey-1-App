import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function JanitorialDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Active Clients', value: '24', icon: Users, color: 'text-blue-600' },
    { label: 'Monthly Revenue', value: '$18,450', icon: DollarSign, color: 'text-green-600' },
    { label: 'Services Today', value: '8', icon: Calendar, color: 'text-purple-600' },
    { label: 'Completion Rate', value: '98%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const todayServices = [
    { client: 'ABC Corp', time: '9:00 AM', service: 'Office Cleaning', status: 'completed' },
    { client: 'XYZ Ltd', time: '11:00 AM', service: 'Deep Clean', status: 'in-progress' },
    { client: 'Tech Hub', time: '2:00 PM', service: 'Carpet Clean', status: 'scheduled' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{service.client}</div>
                        <div className="text-sm text-gray-600">{service.time} - {service.service}</div>
                      </div>
                      <Badge variant={service.status === 'completed' ? 'default' : 'secondary'}>
                        {service.status === 'completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue Goal</span>
                    <span>$20,000</span>
                  </div>
                  <Progress value={92} />
                  <div className="text-sm text-gray-600">$18,450 / $20,000</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Client Satisfaction</span>
                    <span>4.8/5</span>
                  </div>
                  <Progress value={96} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Schedule Service
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Assign Team
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Complete Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Client management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}