import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const CONTRACTS = [
  { id: 'C-2024-001', title: 'IT Infrastructure Support', agency: 'DoD', value: 2500000, status: 'active', endDate: '2025-12-31', performance: 98 },
  { id: 'C-2024-002', title: 'Healthcare System Maintenance', agency: 'VA', value: 1800000, status: 'pending', endDate: '2025-06-30', performance: 95 },
  { id: 'C-2023-015', title: 'Cybersecurity Services', agency: 'DHS', value: 750000, status: 'completed', endDate: '2024-01-15', performance: 92 }
];

export function ContractManagement() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-purple-800/90 to-indigo-800/90">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span>📄</span>
            Active Contracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CONTRACTS.map((contract) => (
              <div key={contract.id} className="bg-black/30 p-3 rounded border border-gray-600/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-medium text-sm">{contract.title}</h4>
                    <p className="text-gray-400 text-xs">{contract.agency} • {contract.id}</p>
                  </div>
                  <Badge className={
                    contract.status === 'active' ? 'bg-green-600/20 text-green-300' :
                    contract.status === 'pending' ? 'bg-yellow-600/20 text-yellow-300' :
                    'bg-gray-600/20 text-gray-300'
                  }>
                    {contract.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Value</p>
                    <p className="text-white">${(contract.value / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-gray-400">End Date</p>
                    <p className="text-white">{contract.endDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Performance</p>
                    <p className="text-green-400">{contract.performance}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-800/90 to-red-800/90">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span>📊</span>
            Contract Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-black/30 p-3 rounded">
              <p className="text-orange-200 text-sm">Total Contract Value</p>
              <p className="text-2xl font-bold text-white">$5.05M</p>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <p className="text-orange-200 text-sm">Average Performance</p>
              <p className="text-2xl font-bold text-white">95%</p>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <p className="text-orange-200 text-sm">Renewal Rate</p>
              <p className="text-2xl font-bold text-white">87%</p>
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Generate Performance Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}