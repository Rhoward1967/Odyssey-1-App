import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { supabase } from '../lib/supabase';
import { Building, DollarSign, TrendingUp, Users, AlertCircle, PieChart } from 'lucide-react';

interface TenantCost {
  tenant_id: string;
  tenant_name: string;
  total_cost: number;
  api_costs: number;
  storage_costs: number;
  compute_costs: number;
  bandwidth_costs: number;
  revenue: number;
  profit_margin: number;
  usage_metrics: {
    api_calls: number;
    storage_gb: number;
    compute_hours: number;
    bandwidth_gb: number;
  };
}

const MultiTenantCostAllocation: React.FC = () => {
  const [tenants, setTenants] = useState<TenantCost[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [newTenantName, setNewTenantName] = useState('');

  useEffect(() => {
    loadTenantCosts();
  }, []);

  const loadTenantCosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cost-optimization-engine', {
        body: { action: 'allocate_tenant_costs' }
      });

      if (error) throw error;

      // Mock tenant data for demonstration
      const mockTenants: TenantCost[] = [
        {
          tenant_id: 'gov-dept-defense',
          tenant_name: 'Department of Defense',
          total_cost: 1250.80,
          api_costs: 850.30,
          storage_costs: 200.50,
          compute_costs: 150.00,
          bandwidth_costs: 50.00,
          revenue: 3500.00,
          profit_margin: 64.3,
          usage_metrics: {
            api_calls: 125000,
            storage_gb: 500,
            compute_hours: 75,
            bandwidth_gb: 250
          }
        },
        {
          tenant_id: 'city-chicago',
          tenant_name: 'City of Chicago',
          total_cost: 680.45,
          api_costs: 420.30,
          storage_costs: 120.15,
          compute_costs: 100.00,
          bandwidth_costs: 40.00,
          revenue: 1800.00,
          profit_margin: 62.2,
          usage_metrics: {
            api_calls: 68000,
            storage_gb: 300,
            compute_hours: 50,
            bandwidth_gb: 180
          }
        },
        {
          tenant_id: 'state-texas',
          tenant_name: 'State of Texas',
          total_cost: 420.25,
          api_costs: 280.15,
          storage_costs: 80.10,
          compute_costs: 45.00,
          bandwidth_costs: 15.00,
          revenue: 1200.00,
          profit_margin: 65.0,
          usage_metrics: {
            api_calls: 45000,
            storage_gb: 200,
            compute_hours: 25,
            bandwidth_gb: 100
          }
        }
      ];

      setTenants(mockTenants);
    } catch (error) {
      console.error('Failed to load tenant costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewTenant = async () => {
    if (!newTenantName.trim()) return;

    const newTenant: TenantCost = {
      tenant_id: newTenantName.toLowerCase().replace(/\s+/g, '-'),
      tenant_name: newTenantName,
      total_cost: 0,
      api_costs: 0,
      storage_costs: 0,
      compute_costs: 0,
      bandwidth_costs: 0,
      revenue: 0,
      profit_margin: 0,
      usage_metrics: {
        api_calls: 0,
        storage_gb: 0,
        compute_hours: 0,
        bandwidth_gb: 0
      }
    };

    setTenants([...tenants, newTenant]);
    setNewTenantName('');
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 60) return 'text-green-600 bg-green-50';
    if (margin >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const totalCosts = tenants.reduce((sum, tenant) => sum + tenant.total_cost, 0);
  const totalRevenue = tenants.reduce((sum, tenant) => sum + tenant.revenue, 0);
  const overallMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Multi-Tenant Cost Allocation</h2>
        <Button onClick={loadTenantCosts} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold">{tenants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Costs</p>
                <p className="text-2xl font-bold">${totalCosts.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Overall Margin</p>
                <p className={`text-2xl font-bold ${overallMargin >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Tenant */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter tenant name..."
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNewTenant()}
            />
            <Button onClick={addNewTenant}>Add Tenant</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenant List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.tenant_id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{tenant.tenant_name}</span>
                <Badge className={getProfitMarginColor(tenant.profit_margin)}>
                  {tenant.profit_margin.toFixed(1)}% margin
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cost Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-lg font-semibold text-red-600">${tenant.total_cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-lg font-semibold text-green-600">${tenant.revenue.toFixed(2)}</p>
                  </div>
                </div>

                {/* Detailed Costs */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Costs:</span>
                    <span>${tenant.api_costs.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage:</span>
                    <span>${tenant.storage_costs.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compute:</span>
                    <span>${tenant.compute_costs.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bandwidth:</span>
                    <span>${tenant.bandwidth_costs.toFixed(2)}</span>
                  </div>
                </div>

                {/* Usage Metrics */}
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Usage Metrics:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>API Calls: {tenant.usage_metrics.api_calls.toLocaleString()}</div>
                    <div>Storage: {tenant.usage_metrics.storage_gb}GB</div>
                    <div>Compute: {tenant.usage_metrics.compute_hours}hrs</div>
                    <div>Bandwidth: {tenant.usage_metrics.bandwidth_gb}GB</div>
                  </div>
                </div>

                {tenant.profit_margin < 40 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-xs text-red-700">Low profit margin - review pricing</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MultiTenantCostAllocation;