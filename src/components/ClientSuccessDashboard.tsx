import { Award, Star, TrendingUp, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function ClientSuccessDashboard() {
  const clients = [
    { name: 'Atlanta Medical Center', satisfaction: 98, revenue: 45000, status: 'active' },
    { name: 'Georgia State University', satisfaction: 96, revenue: 38000, status: 'active' },
    { name: 'City of Athens', satisfaction: 94, revenue: 52000, status: 'active' }
  ];

  return (
    <div className="space-y-6">
      <div 
        className="relative p-8 rounded-lg text-white"
        style={{ 
          backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757917339684_e5a1544c.webp)',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-green-900/80 rounded-lg"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold">Client Success Dashboard</h1>
          <p className="text-xl mt-2">Track client satisfaction and growth metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-3xl font-bold text-blue-600">24</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                <p className="text-3xl font-bold text-green-600">96%</p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                <p className="text-3xl font-bold text-purple-600">+28%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-3xl font-bold text-orange-600">94%</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-green-800">
                      {client.satisfaction}% Satisfaction
                    </Badge>
                    <Badge variant="outline">{client.status}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${client.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}