import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Key, Fingerprint, Globe } from 'lucide-react';

export default function AdvancedSecurityFramework() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    encryptionEnabled: true,
    auditLogging: true,
    intrusionDetection: true,
    dataLossPrevention: false,
    zeroTrustMode: true
  });

  const [threats, setThreats] = useState([
    { id: 1, type: 'Brute Force', severity: 'high', status: 'blocked', timestamp: '2 mins ago' },
    { id: 2, type: 'SQL Injection', severity: 'critical', status: 'blocked', timestamp: '5 mins ago' },
    { id: 3, type: 'XSS Attempt', severity: 'medium', status: 'monitored', timestamp: '8 mins ago' },
    { id: 4, type: 'DDoS Attack', severity: 'high', status: 'mitigated', timestamp: '12 mins ago' }
  ]);

  const [securityScore] = useState(87);

  const [auditLogs] = useState([
    { timestamp: '14:32:15', user: 'admin@company.com', action: 'Login successful', ip: '192.168.1.100' },
    { timestamp: '14:31:45', user: 'user@company.com', action: 'File accessed', ip: '192.168.1.101' },
    { timestamp: '14:30:22', user: 'system', action: 'Security scan completed', ip: 'localhost' },
    { timestamp: '14:29:18', user: 'admin@company.com', action: 'Permission changed', ip: '192.168.1.100' }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Security Framework</h2>
          <p className="text-muted-foreground">Comprehensive security monitoring and threat protection</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Security Score: {securityScore}%
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityScore}%</div>
                <Progress value={securityScore} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Excellent</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <div className="text-xs text-muted-foreground">Being monitored</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Attacks</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <div className="text-xs text-muted-foreground">Last 24 hours</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Encryption Status</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <div className="text-xs text-muted-foreground">AES-256 Encryption</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Features Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(securitySettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {value ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    <Badge variant={value ? 'default' : 'secondary'}>
                      {value ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {threats.slice(0, 4).map((threat) => (
                    <div key={threat.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{threat.type}</div>
                        <div className="text-sm text-muted-foreground">{threat.timestamp}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        <Badge variant={threat.status === 'blocked' ? 'default' : 'secondary'}>
                          {threat.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection & Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        threat.severity === 'critical' ? 'text-red-500' :
                        threat.severity === 'high' ? 'text-orange-500' :
                        threat.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <div>
                        <div className="font-medium">{threat.type}</div>
                        <div className="text-sm text-muted-foreground">{threat.timestamp}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      <Badge variant={threat.status === 'blocked' ? 'default' : 'secondary'}>
                        {threat.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(securitySettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {key === 'twoFactorAuth' && 'Require 2FA for all user accounts'}
                      {key === 'encryptionEnabled' && 'Encrypt all data at rest and in transit'}
                      {key === 'auditLogging' && 'Log all user actions and system events'}
                      {key === 'intrusionDetection' && 'Monitor for suspicious activities'}
                      {key === 'dataLossPrevention' && 'Prevent unauthorized data exfiltration'}
                      {key === 'zeroTrustMode' && 'Verify every request regardless of source'}
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => handleSettingChange(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.user} • {log.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.ip}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}