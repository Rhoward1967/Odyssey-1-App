import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Download, 
  Upload, 
  Search,
  Filter,
  Mail,
  Calendar
} from 'lucide-react';

export default function SubscriberManager() {
  const [subscribers] = useState([
    {
      id: 1,
      email: 'april.brown@gnssurgery.com',
      name: 'April Brown',
      status: 'Active',
      segments: ['Healthcare', 'VIP'],
      joinDate: '2024-01-15',
      lastActivity: '2024-03-10',
      opens: 45,
      clicks: 12
    },
    {
      id: 2,
      email: 'beth.smith@athensclarkecounty.com',
      name: 'Beth Smith',
      status: 'Active',
      segments: ['Government'],
      joinDate: '2024-02-03',
      lastActivity: '2024-03-08',
      opens: 23,
      clicks: 8
    },
    {
      id: 3,
      email: 'john.doe@example.com',
      name: 'John Doe',
      status: 'Unsubscribed',
      segments: ['Commercial'],
      joinDate: '2024-01-20',
      lastActivity: '2024-02-15',
      opens: 12,
      clicks: 3
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const segments = [
    { name: 'All Subscribers', count: 12847, color: 'bg-blue-500' },
    { name: 'Healthcare', count: 3421, color: 'bg-green-500' },
    { name: 'Government', count: 2156, color: 'bg-purple-500' },
    { name: 'Commercial', count: 4234, color: 'bg-orange-500' },
    { name: 'VIP Clients', count: 892, color: 'bg-yellow-500' }
  ];

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || sub.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Subscriber Management</h3>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Subscriber
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {segments.map((segment, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
                <div>
                  <p className="text-sm font-medium">{segment.name}</p>
                  <p className="text-lg font-bold">{segment.count.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscribers</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search subscribers..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSubscribers.map(subscriber => (
              <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{subscriber.name}</div>
                    <div className="text-sm text-gray-600">{subscriber.email}</div>
                    <div className="flex gap-2 mt-1">
                      {subscriber.segments.map(segment => (
                        <Badge key={segment} variant="secondary" className="text-xs">
                          {segment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Joined: {subscriber.joinDate}</div>
                    <div className="text-gray-600">{subscriber.opens} opens, {subscriber.clicks} clicks</div>
                  </div>
                  <Badge variant={subscriber.status === 'Active' ? 'default' : 'secondary'}>
                    {subscriber.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}