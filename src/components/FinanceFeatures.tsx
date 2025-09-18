import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const FinanceFeatures: React.FC = () => {
  const [activeSection, setActiveSection] = useState('trading');

  const sections = {
    trading: {
      title: 'Algorithmic Trading Platform',
      data: [
        { metric: 'Active Strategies', value: '24', change: '+3' },
        { metric: 'Win Rate', value: '73.2%', change: '+2.1%' },
        { metric: 'Daily Volume', value: '$2.4M', change: '+15%' },
        { metric: 'Risk Score', value: '2.3/10', change: '-0.4' }
      ],
      positions: [
        { symbol: 'AAPL', qty: 500, pnl: '+$2,340', status: 'Long' },
        { symbol: 'TSLA', qty: 200, pnl: '-$890', status: 'Short' },
        { symbol: 'MSFT', qty: 750, pnl: '+$4,120', status: 'Long' }
      ]
    },
    risk: {
      title: 'Risk Management Suite',
      data: [
        { metric: 'Portfolio VaR', value: '$45K', change: '-$2K' },
        { metric: 'Stress Test Score', value: '8.7/10', change: '+0.3' },
        { metric: 'Compliance Rate', value: '99.8%', change: '+0.1%' },
        { metric: 'Exposure Limit', value: '67%', change: '-5%' }
      ],
      alerts: [
        { type: 'warning', message: 'Concentration risk in tech sector' },
        { type: 'info', message: 'New regulatory update available' },
        { type: 'success', message: 'All stress tests passed' }
      ]
    },
    analytics: {
      title: 'Financial Analytics Engine',
      data: [
        { metric: 'Alpha Generated', value: '12.4%', change: '+1.8%' },
        { metric: 'Sharpe Ratio', value: '1.89', change: '+0.12' },
        { metric: 'Max Drawdown', value: '4.2%', change: '-0.8%' },
        { metric: 'Information Ratio', value: '2.1', change: '+0.3' }
      ],
      insights: [
        'Market volatility expected to increase 15% next week',
        'Emerging markets showing strong momentum signals',
        'Currency hedging recommended for international positions',
        'Sector rotation favoring healthcare and utilities'
      ]
    }
  };

  const currentSection = sections[activeSection as keyof typeof sections];

  const getAlertColor = (type: string) => {
    const colors = {
      warning: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      info: 'border-blue-300 bg-blue-50 text-blue-800',
      success: 'border-green-300 bg-green-50 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'border-gray-300 bg-gray-50 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(sections).map(([key, section]) => (
          <Button
            key={key}
            variant={activeSection === key ? "default" : "outline"}
            onClick={() => setActiveSection(key)}
            size="sm"
          >
            {section.title}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {currentSection.title}
            <Badge variant="secondary" className="bg-green-100 text-green-800">Finance</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentSection.data.map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{item.metric}</div>
                  <div className="text-xl font-bold text-gray-900">{item.value}</div>
                  <div className={`text-xs ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change}
                  </div>
                </div>
              ))}
            </div>

            {activeSection === 'trading' && 'positions' in currentSection && (
              <div>
                <h3 className="font-semibold mb-3">Active Positions</h3>
                <div className="space-y-2">
                  {currentSection.positions.map((position, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{position.symbol}</Badge>
                        <span className="text-sm">{position.qty} shares</span>
                        <Badge variant={position.status === 'Long' ? 'default' : 'secondary'}>
                          {position.status}
                        </Badge>
                      </div>
                      <div className={`font-medium ${position.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {position.pnl}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'risk' && 'alerts' in currentSection && (
              <div>
                <h3 className="font-semibold mb-3">Risk Alerts</h3>
                <div className="space-y-2">
                  {currentSection.alerts.map((alert, index) => (
                    <div key={index} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                        <span className="text-sm font-medium">{alert.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'analytics' && 'insights' in currentSection && (
              <div>
                <h3 className="font-semibold mb-3">AI Market Insights</h3>
                <div className="space-y-2">
                  {currentSection.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <span className="text-sm text-purple-800">{insight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};