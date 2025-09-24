import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building, Calendar, DollarSign, FileText, Search, Star, Clock } from 'lucide-react';

interface RFP {
  id: string;
  title: string;
  agency: string;
  solicitation: string;
  description: string;
  dueDate: string;
  value: string;
  category: string;
  status: 'open' | 'closing-soon' | 'closed';
  location: string;
  setAside: string;
  postedDate: string;
}



import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function GovernmentRFPPortal() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const { data, error } = await supabase
        .from('rfps')
        .select('*')
        .order('dueDate', { ascending: false });
      if (error) throw error;
      setRfps(data || []);
    } catch (error) {
      console.error('Failed to load RFPs:', error);
      setRfps([]);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'open': 'bg-green-100 text-green-800',
      'closing-soon': 'bg-yellow-100 text-yellow-800',
      'closed': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredRFPs = rfps.filter(rfp => {
    const matchesSearch = rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfp.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || rfp.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || rfp.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-lg"
          style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757917338906_cd1e8726.webp)' }}
        >
          <div className="absolute inset-0 bg-blue-900/80 rounded-lg"></div>
        </div>
        <div className="relative p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Government RFP Portal</h1>
          <p className="text-xl opacity-90">Access federal, state, and local contracting opportunities</p>
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-white text-blue-900">SAM.gov Registered</Badge>
            <Badge className="bg-white text-blue-900">DUNS: 82-902-9292</Badge>
            <Badge className="bg-white text-blue-900">36+ Years Experience</Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active RFPs</p>
                <p className="text-3xl font-bold text-blue-600">{rfps.filter(r => r.status === 'open').length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Closing Soon</p>
                <p className="text-3xl font-bold text-yellow-600">{rfps.filter(r => r.status === 'closing-soon').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-green-600">$3.9M+</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-3xl font-bold text-purple-600">78%</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search RFPs by title, agency, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full lg:w-64">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Janitorial Services">Janitorial Services</SelectItem>
            <SelectItem value="Information Technology">Information Technology</SelectItem>
            <SelectItem value="Facility Maintenance">Facility Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closing-soon">Closing Soon</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* RFP Listings */}
      <div className="space-y-6">
        {filteredRFPs.map((rfp) => (
          <Card key={rfp.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-blue-900 mb-2">{rfp.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {rfp.agency}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {rfp.solicitation}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(rfp.status)}>
                    {rfp.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                  {rfp.status === 'closing-soon' && (
                    <Badge variant="destructive">
                      {getDaysUntilDue(rfp.dueDate)} days left
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{rfp.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Date</p>
                  <p className="text-sm text-gray-900">{new Date(rfp.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Contract Value</p>
                  <p className="text-sm text-gray-900">{rfp.value}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{rfp.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Set Aside</p>
                  <p className="text-sm text-gray-900">{rfp.setAside}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{rfp.category}</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Submit Proposal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}