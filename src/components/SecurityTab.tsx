import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  AlertTriangle, 
  Eye, 
  RefreshCw 
} from 'lucide-react';

export default function SecurityTab() {
  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Firewall Status</p>
                <Badge className="bg-green-600/20 text-green-400 border-green-600 mt-1">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">SSL Certificate</p>
                <Badge className="bg-green-600/20 text-green-400 border-green-600 mt-1">
                  <Lock className="w-3 h-3 mr-1" />
                  Valid
                </Badge>
              </div>
              <Key className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Threat Level</p>
                <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600 mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Low
                </Badge>
              </div>
              <ShieldAlert className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" />
            Security Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/20">
              <Eye className="w-4 h-4 mr-2" />
              View Logs
            </Button>
            <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/20">
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Security
            </Button>
            <Button variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600/20">
              <Shield className="w-4 h-4 mr-2" />
              Run Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 hours ago', event: 'Failed login attempt blocked', severity: 'medium' },
              { time: '6 hours ago', event: 'SSL certificate renewed successfully', severity: 'low' },
              { time: '1 day ago', event: 'Firewall rule updated', severity: 'low' },
              { time: '2 days ago', event: 'Security scan completed - no threats', severity: 'low' },
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event.severity === 'high' ? 'bg-red-400' :
                    event.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <span className="text-white">{event.event}</span>
                </div>
                <span className="text-gray-400 text-sm">{event.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}