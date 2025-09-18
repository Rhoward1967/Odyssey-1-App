import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export const ManufacturingFeatures: React.FC = () => {
  const [activeSystem, setActiveSystem] = useState('production');

  const systems = {
    production: {
      title: 'Smart Production Management',
      lines: [
        { name: 'Assembly Line A', status: 'Running', efficiency: 94, output: 245 },
        { name: 'Assembly Line B', status: 'Maintenance', efficiency: 0, output: 0 },
        { name: 'Assembly Line C', status: 'Running', efficiency: 87, output: 198 },
        { name: 'Quality Control', status: 'Active', efficiency: 98, output: 89 }
      ],
      metrics: { total_output: 532, defect_rate: '0.8%', oee: '89%' }
    },
    supply: {
      title: 'Supply Chain Optimization',
      suppliers: [
        { name: 'Steel Corp', status: 'On Time', reliability: 96, cost_index: 102 },
        { name: 'Electronics Ltd', status: 'Delayed', reliability: 78, cost_index: 98 },
        { name: 'Plastics Inc', status: 'On Time', reliability: 94, cost_index: 105 },
        { name: 'Components Co', status: 'Early', reliability: 99, cost_index: 97 }
      ],
      inventory: { raw_materials: '87%', wip: '23%', finished_goods: '45%' }
    },
    quality: {
      title: 'Quality Assurance System',
      inspections: [
        { stage: 'Incoming Materials', passed: 234, failed: 6, rate: '97.5%' },
        { stage: 'In-Process', passed: 445, failed: 12, rate: '97.4%' },
        { stage: 'Final Inspection', passed: 198, failed: 2, rate: '99.0%' },
        { stage: 'Customer Returns', returned: 3, total: 532, rate: '0.6%' }
      ],
      certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'Six Sigma']
    }
  };

  const currentSystem = systems[activeSystem as keyof typeof systems];

  const getStatusColor = (status: string) => {
    const colors = {
      'Running': 'bg-green-500',
      'Active': 'bg-green-500',
      'On Time': 'bg-green-500',
      'Early': 'bg-blue-500',
      'Maintenance': 'bg-yellow-500',
      'Delayed': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(systems).map(([key, system]) => (
          <Button
            key={key}
            variant={activeSystem === key ? "default" : "outline"}
            onClick={() => setActiveSystem(key)}
            size="sm"
          >
            {system.title}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {currentSystem.title}
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">Manufacturing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activeSystem === 'production' && 'lines' in currentSystem && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(currentSystem.metrics).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{value}</div>
                      <div className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold">Production Lines Status</h3>
                  {currentSystem.lines.map((line, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(line.status)}`}></div>
                        <span className="font-medium">{line.name}</span>
                        <Badge variant="outline" size="sm">{line.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Efficiency: {line.efficiency}%</span>
                        <span>Output: {line.output}/hr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSystem === 'supply' && 'suppliers' in currentSystem && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(currentSystem.inventory).map(([key, value]) => (
                    <div key={key} className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2 capitalize">{key.replace('_', ' ')}</div>
                      <div className="text-xl font-bold text-blue-600">{value}</div>
                      <Progress value={parseInt(value)} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold">Supplier Performance</h3>
                  {currentSystem.suppliers.map((supplier, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(supplier.status)}`}></div>
                        <span className="font-medium">{supplier.name}</span>
                        <Badge variant="outline" size="sm">{supplier.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Reliability: {supplier.reliability}%</span>
                        <span>Cost Index: {supplier.cost_index}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSystem === 'quality' && 'inspections' in currentSystem && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Quality Metrics</h3>
                    {currentSystem.inspections.map((inspection, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">{inspection.stage}</span>
                          <Badge variant="secondary">{inspection.rate}</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Passed: {inspection.passed} | Failed: {inspection.failed || inspection.returned || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Certifications</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {currentSystem.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="justify-center p-2">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Process Improvements</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Defect rate reduced by 15% this quarter</li>
                        <li>• OEE improved by 8% with AI optimization</li>
                        <li>• Predictive maintenance saved 24 hours downtime</li>
                        <li>• Energy consumption reduced by 12%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};