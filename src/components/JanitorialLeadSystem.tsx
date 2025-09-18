import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, MapPin, DollarSign, Users, Phone, Mail, Calendar, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  building_type: string;
  estimated_value: number;
  lead_score: number;
  status: string;
  created_at: string;
}

export default function JanitorialLeadSystem() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    service: 'all'
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('janitorial_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('janitorial_leads')
        .update({ status })
        .eq('id', leadId);
      
      if (error) throw error;
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filters.status !== 'all' && lead.status !== filters.status) return false;
    return true;
  });
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
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'qualified': return 'bg-orange-100 text-orange-800';
      case 'sold': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Janitorial Lead System</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {leads.length} Total Leads
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ${leads.reduce((sum, lead) => sum + lead.estimated_value, 0).toLocaleString()} Total Value
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Status Filter</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div>
                  <Label>Priority Filter</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <Label>Service Filter</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={filters.service}
                    onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
                  >
                    <option value="all">All Services</option>
                    <option value="office">Office Cleaning</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="residential">Residential</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{lead.business_name}</CardTitle>
                    <div className="flex gap-1">
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority}
                      </Badge>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{lead.contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{lead.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{lead.service_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span>${lead.estimated_value.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => updateLeadStatus(lead.id, 'contacted')}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(`mailto:${lead.email}`)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {leads.filter(l => l.status === 'new').length}
                </div>
                <div className="text-sm text-gray-600">New Leads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {leads.filter(l => l.status === 'contacted').length}
                </div>
                <div className="text-sm text-gray-600">Contacted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {leads.filter(l => l.status === 'qualified').length}
                </div>
                <div className="text-sm text-gray-600">Qualified</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {leads.filter(l => l.status === 'sold').length}
                </div>
                <div className="text-sm text-gray-600">Closed Deals</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Pricing Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Service Type</Label>
                  <select className="w-full p-2 border rounded-md bg-white">
                    <option>Office Cleaning - $25/lead</option>
                    <option>Commercial - $35/lead</option>
                    <option>Industrial - $50/lead</option>
                    <option>Residential - $15/lead</option>
                  </select>
                </div>
                <div>
                  <Label>Lead Quality</Label>
                  <select className="w-full p-2 border rounded-md bg-white">
                    <option>High Priority - 2x multiplier</option>
                    <option>Medium Priority - 1.5x multiplier</option>
                    <option>Low Priority - 1x multiplier</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">$35.00</div>
                  <div className="text-sm text-blue-600">Price per lead</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}