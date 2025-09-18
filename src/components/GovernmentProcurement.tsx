import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ContractManagement } from './ContractManagement';
import { SAMRegistration } from './SAMRegistration';

interface RFQData {
  id: string;
  title: string;
  agency: string;
  deadline: string;
  value: number;
  status: 'open' | 'submitted' | 'awarded' | 'closed';
  compliance: number;
}

const SAMPLE_RFQS: RFQData[] = [
  { id: 'RFQ-2024-001', title: 'IT Infrastructure Modernization', agency: 'Department of Defense', deadline: '2024-03-15', value: 2500000, status: 'open', compliance: 95 },
  { id: 'RFP-2024-002', title: 'Healthcare Management System', agency: 'Veterans Affairs', deadline: '2024-04-01', value: 1800000, status: 'submitted', compliance: 98 },
  { id: 'RFQ-2024-003', title: 'Cybersecurity Assessment Services', agency: 'Homeland Security', deadline: '2024-03-30', value: 750000, status: 'open', compliance: 92 }
];

export function GovernmentProcurement() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rfq' | 'rfp' | 'compliance' | 'contracts' | 'clearance' | 'gsa'>('dashboard');
  const [selectedRFQ, setSelectedRFQ] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');

  const calculateWinProbability = (compliance: number, bidValue: number, marketValue: number) => {
    const complianceScore = compliance / 100;
    const priceScore = Math.max(0, 1 - Math.abs(bidValue - marketValue) / marketValue);
    return Math.round((complianceScore * 0.6 + priceScore * 0.4) * 100);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-900/90 to-indigo-900/90 border-2 border-amber-500/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            HJS SERVICES LLC - Government Procurement
          </CardTitle>
          <div className="space-y-2">
            <p className="text-gray-300">
              SAM.gov Registered • UEI: YXEYCV2T1DM5 • CAGE: 97K10
            </p>
            <p className="text-amber-300 text-sm">
              Registration Active until August 12, 2026 • Owner: RICKEY HOWARD
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'rfq', name: 'RFQ Manager', icon: '📋' },
              { id: 'contracts', name: 'Contracts', icon: '📄' },
              { id: 'clearance', name: 'Clearance', icon: '🔐' },
              { id: 'gsa', name: 'GSA Schedule', icon: '🏪' },
               { id: 'compliance', name: 'Compliance', icon: '✅' }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id as any)}
                className={activeTab === tab.id ? "bg-amber-600 hover:bg-amber-700" : ""}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <SAMRegistration />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-800/90 to-emerald-800/90">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm font-medium">Active Opportunities</p>
                    <p className="text-3xl font-bold text-white">24</p>
                  </div>
                  <span className="text-4xl">📈</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-800/90 to-cyan-800/90">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Submitted Bids</p>
                    <p className="text-3xl font-bold text-white">8</p>
                  </div>
                  <span className="text-4xl">📤</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-800/90 to-indigo-800/90">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">Win Rate</p>
                    <p className="text-3xl font-bold text-white">67%</p>
                  </div>
                  <span className="text-4xl">🏆</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-800/90 to-red-800/90">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Total Value</p>
                    <p className="text-3xl font-bold text-white">$12.8M</p>
                  </div>
                  <span className="text-4xl">💰</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'rfq' && (
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span>📋</span>
              RFQ/RFP Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SAMPLE_RFQS.map((rfq) => (
                <div key={rfq.id} className="bg-black/30 p-4 rounded-lg border border-gray-600/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold">{rfq.title}</h3>
                      <p className="text-gray-300 text-sm">{rfq.agency} • {rfq.id}</p>
                    </div>
                    <Badge className={
                      rfq.status === 'open' ? 'bg-green-600/20 text-green-300' :
                      rfq.status === 'submitted' ? 'bg-blue-600/20 text-blue-300' :
                      rfq.status === 'awarded' ? 'bg-purple-600/20 text-purple-300' :
                      'bg-gray-600/20 text-gray-300'
                    }>
                      {rfq.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Deadline</p>
                      <p className="text-white">{rfq.deadline}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Value</p>
                      <p className="text-white">${(rfq.value / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Compliance</p>
                      <p className="text-green-400">{rfq.compliance}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Win Probability</p>
                      <p className="text-amber-400">{calculateWinProbability(rfq.compliance, rfq.value * 0.95, rfq.value)}%</p>
                    </div>
                  </div>
                  
                  {rfq.status === 'open' && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Generate Proposal
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-800/90 to-emerald-800/90">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span>✅</span>
                Compliance Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'FAR Compliance', status: 98, color: 'green' },
                  { name: 'DFARS Requirements', status: 95, color: 'green' },
                  { name: 'Security Clearance', status: 100, color: 'green' },
                  { name: 'Small Business Cert', status: 85, color: 'yellow' }
                ].map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <span className="text-white text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.color === 'green' ? 'bg-green-500' : 
                            item.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.status}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">{item.status}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-800/90 to-indigo-800/90">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span>🎯</span>
                Bid Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedRFQ} onValueChange={setSelectedRFQ}>
                  <SelectTrigger className="bg-black/30 border-gray-600">
                    <SelectValue placeholder="Select RFQ/RFP" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_RFQS.map((rfq) => (
                      <SelectItem key={rfq.id} value={rfq.id}>
                        {rfq.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Enter bid amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="bg-black/30 border-gray-600"
                />
                
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Analyze Bid Strategy
                </Button>
                
                {selectedRFQ && bidAmount && (
                  <div className="bg-black/30 p-3 rounded border border-purple-500/30">
                    <p className="text-purple-300 text-sm font-medium">AI Recommendation:</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Your bid is competitive. Consider emphasizing past performance and technical approach.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'contracts' && <ContractManagement />}

      {activeTab === 'clearance' && (
        <Card className="bg-gradient-to-br from-red-800/90 to-pink-800/90">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span>🔐</span>
              Security Clearance Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { level: 'Secret', personnel: 45, expires: '2025-08-15', status: 'active' },
                { level: 'Top Secret', personnel: 12, expires: '2025-03-22', status: 'renewal' },
                { level: 'TS/SCI', personnel: 3, expires: '2024-12-01', status: 'expired' }
              ].map((clearance) => (
                <div key={clearance.level} className="bg-black/30 p-4 rounded border border-gray-600/50">
                  <h4 className="text-white font-bold">{clearance.level}</h4>
                  <p className="text-gray-300 text-sm">{clearance.personnel} Personnel</p>
                  <p className="text-gray-400 text-xs">Expires: {clearance.expires}</p>
                  <Badge className={
                    clearance.status === 'active' ? 'bg-green-600/20 text-green-300' :
                    clearance.status === 'renewal' ? 'bg-yellow-600/20 text-yellow-300' :
                    'bg-red-600/20 text-red-300'
                  }>
                    {clearance.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'gsa' && (
        <Card className="bg-gradient-to-br from-teal-800/90 to-cyan-800/90">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span>🏪</span>
              GSA Schedule Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded">
                <h4 className="text-white font-bold">GSA Multiple Award Schedule (MAS)</h4>
                <p className="text-gray-300 text-sm">Contract: GS-35F-0119Y</p>
                <p className="text-gray-400 text-xs">Expires: March 15, 2029</p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-teal-200 text-sm">Annual Sales</p>
                    <p className="text-xl font-bold text-white">$2.8M</p>
                  </div>
                  <div>
                    <p className="text-teal-200 text-sm">IFF Rate</p>
                    <p className="text-xl font-bold text-white">0.75%</p>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Submit Quarterly Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}