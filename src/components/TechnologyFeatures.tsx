import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const TechnologyFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState('development');

  const features = {
    development: {
      title: 'Software Development Suite',
      tools: [
        { name: 'Code Review AI', status: 'active', efficiency: '95%' },
        { name: 'Bug Detection', status: 'scanning', efficiency: '87%' },
        { name: 'Performance Optimizer', status: 'active', efficiency: '92%' },
        { name: 'Security Auditor', status: 'monitoring', efficiency: '98%' }
      ],
      metrics: { projects: 24, bugs_fixed: 1247, deployments: 89 }
    },
    devops: {
      title: 'DevOps Automation',
      tools: [
        { name: 'CI/CD Pipeline', status: 'running', efficiency: '99%' },
        { name: 'Container Orchestration', status: 'active', efficiency: '94%' },
        { name: 'Infrastructure Monitor', status: 'monitoring', efficiency: '96%' },
        { name: 'Auto-Scaling', status: 'optimizing', efficiency: '91%' }
      ],
      metrics: { deployments: 156, uptime: '99.9%', servers: 42 }
    },
    analytics: {
      title: 'Data Analytics Platform',
      tools: [
        { name: 'Real-time Analytics', status: 'processing', efficiency: '93%' },
        { name: 'ML Model Training', status: 'learning', efficiency: '89%' },
        { name: 'Predictive Insights', status: 'forecasting', efficiency: '91%' },
        { name: 'Data Visualization', status: 'rendering', efficiency: '97%' }
      ],
      metrics: { data_points: '2.4M', models: 18, accuracy: '94.2%' }
    }
  };

  const currentFeature = features[activeFeature as keyof typeof features];

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      running: 'bg-blue-500',
      scanning: 'bg-yellow-500',
      monitoring: 'bg-purple-500',
      optimizing: 'bg-orange-500',
      processing: 'bg-cyan-500',
      learning: 'bg-pink-500',
      forecasting: 'bg-indigo-500',
      rendering: 'bg-teal-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(features).map(([key, feature]) => (
          <Button
            key={key}
            variant={activeFeature === key ? "default" : "outline"}
            onClick={() => setActiveFeature(key)}
            size="sm"
          >
            {feature.title}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {currentFeature.title}
            <Badge variant="secondary">Technology Industry</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Active Tools</h3>
              {currentFeature.tools.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(tool.status)} animate-pulse`}></div>
                    <span className="font-medium">{tool.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{tool.status}</Badge>
                    <span className="text-sm text-green-600 font-medium">{tool.efficiency}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(currentFeature.metrics).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">AI Insights</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Code quality improved by 34% this month</li>
                  <li>• Deployment frequency increased 2.3x</li>
                  <li>• Security vulnerabilities reduced by 67%</li>
                  <li>• Team productivity up 45%</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};