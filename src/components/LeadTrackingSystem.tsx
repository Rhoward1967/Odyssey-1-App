import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, TrendingUp, Calendar, Phone, Mail, Building } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed-won' | 'closed-lost';
  source: string;
  value: number;
  dateAdded: string;
  lastContact: string;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'Atlanta Medical Center',
    email: 'sarah.j@atlantamedical.com',
    phone: '(404) 555-0123',
    status: 'qualified',
    source: 'Google Ads',
    value: 15000,
    dateAdded: '2024-01-15',
    lastContact: '2024-01-20'
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'Georgia State University',
    email: 'm.chen@gsu.edu',
    phone: '(678) 555-0456',
    status: 'proposal',
    source: 'LinkedIn',
    value: 25000,
    dateAdded: '2024-01-12',
    lastContact: '2024-01-22'
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    company: 'City of Athens',
    email: 'l.rodriguez@athensga.gov',
    phone: '(706) 555-0789',
    status: 'contacted',
    source: 'SAM.gov',
    value: 35000,
    dateAdded: '2024-01-18',
    lastContact: '2024-01-21'
  }
];

export default function LeadTrackingSystem() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'proposal': 'bg-purple-100 text-purple-800',
      'closed-won': 'bg-emerald-100 text-emerald-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const qualifiedLeads = leads.filter(lead => ['qualified', 'proposal'].includes(lead.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Tracking System</h1>
          <p className="text-gray-600 mt-2">Manage and track your sales pipeline</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-3xl font-bold text-green-600">{qualifiedLeads}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-3xl font-bold text-purple-600">${totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-orange-600">24%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="closed-won">Closed Won</SelectItem>
            <SelectItem value="closed-lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        {lead.company}
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Last contact: {lead.lastContact}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">${lead.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Source: {lead.source}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}