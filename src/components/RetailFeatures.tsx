import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const RetailFeatures: React.FC = () => {
  const [activeModule, setActiveModule] = useState('inventory');

  const modules = {
    inventory: {
      title: 'Smart Inventory Management',
      categories: [
        { name: 'Electronics', stock: 1247, reorder: 23, turnover: '8.2x' },
        { name: 'Clothing', stock: 3456, reorder: 67, turnover: '12.1x' },
        { name: 'Home & Garden', stock: 892, reorder: 12, turnover: '6.4x' },
        { name: 'Sports', stock: 567, reorder: 8, turnover: '9.8x' }
      ],
      alerts: ['Low stock: iPhone 15 Pro', 'Seasonal trend: Winter coats', 'Overstock: Summer items']
    },
    sales: {
      title: 'Sales Analytics & Forecasting',
      metrics: [
        { period: 'Today', revenue: '$12,450', orders: 89, avg_order: '$140' },
        { period: 'This Week', revenue: '$78,230', orders: 456, avg_order: '$171' },
        { period: 'This Month', revenue: '$234,560', orders: 1234, avg_order: '$190' },
        { period: 'This Quarter', revenue: '$892,340', orders: 4567, avg_order: '$195' }
      ],
      trends: ['Mobile sales up 34%', 'Weekend performance +12%', 'Premium products growing']
    },
    customer: {
      title: 'Customer Experience Platform',
      segments: [
        { type: 'VIP Customers', count: 234, ltv: '$2,340', satisfaction: '4.8/5' },
        { type: 'Regular Customers', count: 1567, ltv: '$890', satisfaction: '4.2/5' },
        { type: 'New Customers', count: 456, ltv: '$156', satisfaction: '4.0/5' },
        { type: 'At-Risk Customers', count: 89, ltv: '$45', satisfaction: '3.2/5' }
      ],
      campaigns: ['Welcome series: 23% open rate', 'Loyalty program: 67% engagement', 'Win-back: 12% conversion']
    }
  };

  const currentModule = modules[activeModule as keyof typeof modules];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(modules).map(([key, module]) => (
          <Button
            key={key}
            variant={activeModule === key ? "default" : "outline"}
            onClick={() => setActiveModule(key)}
            size="sm"
          >
            {module.title}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {currentModule.title}
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">Retail</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activeModule === 'inventory' && 'categories' in currentModule && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentModule.categories.map((category, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-3">{category.name}</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Stock:</span>
                          <span className="font-medium">{category.stock.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reorder:</span>
                          <span className="font-medium text-orange-600">{category.reorder}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Turnover:</span>
                          <span className="font-medium text-green-600">{category.turnover}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Inventory Alerts</h4>
                  <ul className="space-y-1">
                    {currentModule.alerts.map((alert, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeModule === 'sales' && 'metrics' in currentModule && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentModule.metrics.map((metric, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                      <div className="text-sm text-gray-600 mb-2">{metric.period}</div>
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-green-600">{metric.revenue}</div>
                        <div className="text-sm text-gray-700">{metric.orders} orders</div>
                        <div className="text-sm text-blue-600">Avg: {metric.avg_order}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Sales Trends</h4>
                  <ul className="space-y-1">
                    {currentModule.trends.map((trend, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeModule === 'customer' && 'segments' in currentModule && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentModule.segments.map((segment, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                      <h4 className="font-medium text-sm mb-3">{segment.type}</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Count:</span>
                          <span className="font-medium">{segment.count.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>LTV:</span>
                          <span className="font-medium text-green-600">{segment.ltv}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Satisfaction:</span>
                          <span className="font-medium text-blue-600">{segment.satisfaction}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Active Campaigns</h4>
                  <ul className="space-y-1">
                    {currentModule.campaigns.map((campaign, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {campaign}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};