import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Scan, FileText, Users, Database } from 'lucide-react';

interface ComplianceCheck {
  id: string;
  name: string;
  category: 'SOC2' | 'GDPR' | 'Security' | 'Privacy';
  status: 'compliant' | 'warning' | 'non-compliant';
  description: string;
  lastCheck: Date;
}

interface SecurityScan {
  type: string;
  findings: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastRun: Date;
}

export default function SecurityComplianceFramework() {
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([
    {
      id: 'soc2-access-control',
      name: 'Access Control Management',
      category: 'SOC2',
      status: 'compliant',
      description: 'User access is properly controlled and monitored',
      lastCheck: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'gdpr-data-retention',
      name: 'Data Retention Policies',
      category: 'GDPR',
      status: 'warning',
      description: 'Some data retention policies need review',
      lastCheck: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 'security-encryption',
      name: 'Data Encryption',
      category: 'Security',
      status: 'compliant',
      description: 'All sensitive data is properly encrypted',
      lastCheck: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: 'gdpr-consent',
      name: 'User Consent Management',
      category: 'GDPR',
      status: 'non-compliant',
      description: 'Consent tracking system needs implementation',
      lastCheck: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ]);

  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([
    {
      type: 'Vulnerability Scan',
      findings: 2,
      severity: 'medium',
      lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      type: 'RLS Policy Audit',
      findings: 5,
      severity: 'high',
      lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      type: 'Access Log Review',
      findings: 0,
      severity: 'low',
      lastRun: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);

  const [overallScore, setOverallScore] = useState(78);
  const [isScanning, setIsScanning] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const runComplianceScan = async () => {
    setIsScanning(true);
    
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update some compliance checks
    setComplianceChecks(prev => prev.map(check => ({
      ...check,
      lastCheck: new Date(),
      status: Math.random() > 0.3 ? 'compliant' : check.status
    })));
    
    setOverallScore(Math.floor(Math.random() * 20) + 75);
    setIsScanning(false);
  };

  const getCategoryStats = (category: string) => {
    const categoryChecks = complianceChecks.filter(check => check.category === category);
    const compliant = categoryChecks.filter(check => check.status === 'compliant').length;
    return { total: categoryChecks.length, compliant };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>Security Compliance Framework</span>
            </div>
            <Button 
              onClick={runComplianceScan}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Scan className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Run Compliance Scan'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Compliance Score</span>
                <span className="font-medium">{overallScore}%</span>
              </div>
              <Progress value={overallScore} className="h-2" />
            </div>
            <div className={`text-2xl font-bold ${overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {overallScore >= 80 ? 'Good' : overallScore >= 60 ? 'Fair' : 'Poor'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['SOC2', 'GDPR', 'Security', 'Privacy'].map(category => {
          const stats = getCategoryStats(category);
          const percentage = stats.total > 0 ? (stats.compliant / stats.total) * 100 : 0;
          
          return (
            <Card key={category}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-lg font-semibold">{category}</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.compliant}/{stats.total}
                  </div>
                  <Progress value={percentage} className="mt-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(percentage)}% compliant
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compliance">Compliance Checks</TabsTrigger>
          <TabsTrigger value="scans">Security Scans</TabsTrigger>
          <TabsTrigger value="policies">Policy Management</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        {check.status === 'compliant' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {check.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {check.status === 'non-compliant' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      </div>
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-gray-600">{check.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last checked: {check.lastCheck.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(check.status)}>
                        {check.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{check.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scans">
          <Card>
            <CardHeader>
              <CardTitle>Security Scan Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Scan className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">{scan.type}</div>
                        <div className="text-sm text-gray-600">
                          {scan.findings} findings • Last run: {scan.lastRun.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getSeverityColor(scan.severity)}`}>
                        {scan.severity.toUpperCase()}
                      </span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Security Policy Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex-col" variant="outline">
                  <FileText className="h-6 w-6 mb-2" />
                  Data Retention Policy
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Users className="h-6 w-6 mb-2" />
                  Access Control Policy
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Lock className="h-6 w-6 mb-2" />
                  Encryption Standards
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Eye className="h-6 w-6 mb-2" />
                  Privacy Policy
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Database className="h-6 w-6 mb-2" />
                  Data Processing Policy
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Shield className="h-6 w-6 mb-2" />
                  Incident Response Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}