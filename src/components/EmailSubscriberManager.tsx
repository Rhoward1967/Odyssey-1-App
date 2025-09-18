import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserPlus, Search, Filter, Download, Upload } from 'lucide-react';

const EmailSubscriberManager = () => {
  const [subscribers, setSubscribers] = useState([
    {
      id: 1,
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      status: 'active',
      subscribedAt: '2024-01-15',
      tags: ['customer', 'premium']
    },
    {
      id: 2,
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      status: 'active',
      subscribedAt: '2024-02-20',
      tags: ['lead', 'newsletter']
    },
    {
      id: 3,
      email: 'bob.wilson@example.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      status: 'unsubscribed',
      subscribedAt: '2024-01-10',
      tags: ['customer']
    },
    {
      id: 4,
      email: 'alice.brown@example.com',
      firstName: 'Alice',
      lastName: 'Brown',
      status: 'bounced',
      subscribedAt: '2024-03-05',
      tags: ['lead']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    firstName: '',
    lastName: '',
    tags: ''
  });

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubscriber = () => {
    const subscriber = {
      id: Date.now(),
      email: newSubscriber.email,
      firstName: newSubscriber.firstName,
      lastName: newSubscriber.lastName,
      status: 'active',
      subscribedAt: new Date().toISOString().split('T')[0],
      tags: newSubscriber.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    setSubscribers([...subscribers, subscriber]);
    setNewSubscriber({ email: '', firstName: '', lastName: '', tags: '' });
  };

  const updateSubscriberStatus = (id: number, newStatus: string) => {
    setSubscribers(subscribers.map(s => 
      s.id === id ? { ...s, status: newStatus } : s
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'unsubscribed': return 'secondary';
      case 'bounced': return 'destructive';
      case 'complained': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusCounts = () => {
    return {
      total: subscribers.length,
      active: subscribers.filter(s => s.status === 'active').length,
      unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
      bounced: subscribers.filter(s => s.status === 'bounced').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Subscriber Management</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subscriber</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSubscriber.email}
                    onChange={(e) => setNewSubscriber({...newSubscriber, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newSubscriber.firstName}
                      onChange={(e) => setNewSubscriber({...newSubscriber, firstName: e.target.value})}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newSubscriber.lastName}
                      onChange={(e) => setNewSubscriber({...newSubscriber, lastName: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newSubscriber.tags}
                    onChange={(e) => setNewSubscriber({...newSubscriber, tags: e.target.value})}
                    placeholder="customer, premium, newsletter"
                  />
                </div>
                <Button onClick={handleAddSubscriber} className="w-full">
                  Add Subscriber
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subscriber Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{statusCounts.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
                <p className="text-2xl font-bold">{statusCounts.unsubscribed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bounced</p>
                <p className="text-2xl font-bold">{statusCounts.bounced}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <select
                className="border rounded px-3 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
                <option value="complained">Complained</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriber Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.firstName} {subscriber.lastName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(subscriber.status)}>
                      {subscriber.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscriber.subscribedAt}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {subscriber.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {subscriber.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubscriberStatus(subscriber.id, 'unsubscribed')}
                        >
                          Unsubscribe
                        </Button>
                      )}
                      {subscriber.status === 'unsubscribed' && (
                        <Button
                          size="sm"
                          onClick={() => updateSubscriberStatus(subscriber.id, 'active')}
                        >
                          Resubscribe
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSubscriberManager;