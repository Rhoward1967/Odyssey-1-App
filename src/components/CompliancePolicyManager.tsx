import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../lib/supabase';
import { Shield, AlertTriangle, CheckCircle, FileText, Users } from 'lucide-react';

interface ComplianceItem {
  id: string;
  name: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  percentage: number;
  last_updated: string;
  description: string;
}

interface PolicyDocument {
  id: string;
  title: string;
  category: string;
  last_updated: string;
  version: string;
  requires_acknowledgment: boolean;
  acknowledged_count: number;
  total_employees: number;
}

const CompliancePolicyManager: React.FC = () => {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [newPolicy, setNewPolicy] = useState({ title: '', category: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Try to load from Supabase first, fallback to mock data
      const { data: complianceData, error: complianceError } = await supabase
        .from('compliance_tracking')
        .select('*');

      const { data: policyData, error: policyError } = await supabase
        .from('policy_documents')
        .select('*')
        .order('last_updated', { ascending: false });

      if (complianceError || policyError) {
        // Fallback to mock data
        setComplianceItems([
          {
            id: '1',
            name: 'I-9 Employment Verification',
            status: 'compliant',
            percentage: 100,
            last_updated: '2024-01-15',
            description: 'All employees have completed I-9 forms'
          },
          {
            id: '2',
            name: 'W-4 Tax Forms',
            status: 'compliant',
            percentage: 98,
            last_updated: '2024-01-10',
            description: 'Current tax withholding forms on file'
          },
          {
            id: '3',
            name: 'OSHA Safety Training',
            status: 'warning',
            percentage: 85,
            last_updated: '2024-01-05',
            description: '2 employees need updated safety certification'
          },
          {
            id: '4',
            name: 'Background Check Renewals',
            status: 'warning',
            percentage: 87,
            last_updated: '2024-01-01',
            description: '2 background checks expiring soon'
          },
          {
            id: '5',
            name: 'Drug Testing Compliance',
            status: 'compliant',
            percentage: 100,
            last_updated: '2024-01-12',
            description: 'All required testing completed'
          }
        ]);

        setPolicies([
          {
            id: '1',
            title: 'Employee Handbook 2024',
            category: 'General',
            last_updated: '2024-01-01',
            version: '2.1',
            requires_acknowledgment: true,
            acknowledged_count: 13,
            total_employees: 15
          },
          {
            id: '2',
            title: 'Safety Protocols',
            category: 'Safety',
            last_updated: '2024-01-15',
            version: '1.3',
            requires_acknowledgment: true,
            acknowledged_count: 15,
            total_employees: 15
          },
          {
            id: '3',
            title: 'Anti-Harassment Policy',
            category: 'HR',
            last_updated: '2023-12-01',
            version: '1.0',
            requires_acknowledgment: true,
            acknowledged_count: 14,
            total_employees: 15
          }
        ]);
      } else {
        setComplianceItems(complianceData || []);
        setPolicies(policyData || []);
      }
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    if (!newPolicy.title || !newPolicy.category || !newPolicy.content) return;

    try {
      const policyDoc = {
        id: Date.now().toString(),
        title: newPolicy.title,
        category: newPolicy.category,
        last_updated: new Date().toISOString().split('T')[0],
        version: '1.0',
        requires_acknowledgment: true,
        acknowledged_count: 0,
        total_employees: 15
      };

      const { error } = await supabase
        .from('policy_documents')
        .insert([policyDoc]);

      if (error) throw error;

      setPolicies(prev => [policyDoc, ...prev]);
      setNewPolicy({ title: '', category: '', content: '' });
    } catch (error) {
      console.error('Error creating policy:', error);
      // Add to local state anyway for demo
      const policyDoc = {
        id: Date.now().toString(),
        title: newPolicy.title,
        category: newPolicy.category,
        last_updated: new Date().toISOString().split('T')[0],
        version: '1.0',
        requires_acknowledgment: true,
        acknowledged_count: 0,
        total_employees: 15
      };
      setPolicies(prev => [policyDoc, ...prev]);
      setNewPolicy({ title: '', category: '', content: '' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'non_compliant':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Compliance & Policy Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Compliance Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceItems.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <h3 className="font-semibold">{item.name}</h3>
                  </div>
                  <Badge 
                    variant={item.status === 'compliant' ? 'default' : 
                            item.status === 'warning' ? 'secondary' : 'destructive'}
                  >
                    {item.percentage}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Last Updated: {new Date(item.last_updated).toLocaleDateString()}</span>
                  <Button size="sm" variant="outline">
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Policy Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{policy.title}</h3>
                  <Badge variant="outline">v{policy.version}</Badge>
                </div>
                <div className="text-sm space-y-1 mb-3">
                  <div><strong>Category:</strong> {policy.category}</div>
                  <div><strong>Updated:</strong> {new Date(policy.last_updated).toLocaleDateString()}</div>
                  {policy.requires_acknowledgment && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{policy.acknowledged_count}/{policy.total_employees} acknowledged</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    Send Reminder
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="policy-title">Policy Title</Label>
              <Input
                id="policy-title"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter policy title"
              />
            </div>
            <div>
              <Label htmlFor="policy-category">Category</Label>
              <Input
                id="policy-category"
                value={newPolicy.category}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., HR, Safety, General"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="policy-content">Policy Content</Label>
            <Textarea
              id="policy-content"
              value={newPolicy.content}
              onChange={(e) => setNewPolicy(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter policy content and guidelines..."
              rows={6}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreatePolicy}>
              Create Policy
            </Button>
            <Button variant="outline">
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompliancePolicyManager;