import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FileText, Shield, User, Database, Settings, Download, Filter, Calendar as CalendarIcon, Search, Eye, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  category: 'authentication' | 'data' | 'system' | 'security' | 'admin';
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
}

export default function AuditTrailSystem() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: '1',
      timestamp: '2025-09-16T10:05:00Z',
      userId: 'admin-1',
      userEmail: 'christlahoward63@gmail.com',
      action: 'HJS Admin Access',
      category: 'admin',
      resource: 'User Management',
      details: 'CEO accessed employee management system',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/118.0.0.0',
      severity: 'medium',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2025-09-16T10:00:00Z',
      userId: 'user-1',
      userEmail: 'a.r.barnett11@gmail.com',
      action: 'Login Attempt',
      category: 'authentication',
      resource: 'Authentication System',
      details: 'VP Operations successful login from mobile device',
      ipAddress: '192.168.1.101',
      userAgent: 'Mobile Safari/17.0',
      severity: 'low',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2025-09-16T09:55:00Z',
      userId: 'architect',
      userEmail: 'rickey@odyssey.com',
      action: 'System Modification',
      category: 'system',
      resource: 'Core Architecture',
      details: 'Architect updated admin privilege system',
      ipAddress: '192.168.1.102',
      userAgent: 'Chrome/118.0.0.0',
      severity: 'high',
      status: 'success'
    },
    {
      id: '4',
      timestamp: '2025-09-16T09:45:00Z',
      userId: 'unknown',
      userEmail: 'unknown@suspicious.com',
      action: 'Failed Login',
      category: 'security',
      resource: 'Authentication System',
      details: 'Multiple failed login attempts detected',
      ipAddress: '203.0.113.1',
      userAgent: 'Bot/1.0',
      severity: 'critical',
      status: 'failure'
    },
    {
      id: '5',
      timestamp: '2025-09-16T09:30:00Z',
      userId: 'employee-1',
      userEmail: 'john@howardjanitorial.net',
      action: 'Schedule Access',
      category: 'data',
      resource: 'Employee Schedule',
      details: 'Employee viewed weekly schedule',
      ipAddress: '192.168.1.150',
      userAgent: 'Chrome/118.0.0.0',
      severity: 'low',
      status: 'success'
    }
  ]);

  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>(auditEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  useEffect(() => {
    let filtered = auditEvents;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, categoryFilter, severityFilter, auditEvents]);

  const getCategoryIcon = (category: string) => {
    const icons = {
      authentication: User,
      data: Database,
      system: Settings,
      security: Shield,
      admin: FileText
    };
    const Icon = icons[category as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failure: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const exportAuditLog = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Category', 'Resource', 'Details', 'IP Address', 'Severity', 'Status'],
      ...filteredEvents.map(event => [
        event.timestamp,
        event.userEmail,
        event.action,
        event.category,
        event.resource,
        event.details,
        event.ipAddress,
        event.severity,
        event.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const securityAlerts = auditEvents.filter(event => 
    event.severity === 'high' || event.severity === 'critical' || event.status === 'failure'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail System</h2>
          <p className="text-muted-foreground">Monitor and track all system activities and user actions</p>
        </div>
        <Button onClick={exportAuditLog}>
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{auditEvents.length}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{securityAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Security Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{new Set(auditEvents.map(e => e.userId)).size}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">99.8%</p>
                <p className="text-xs text-muted-foreground">Security Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Events</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getCategoryIcon(event.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{event.action}</p>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{event.details}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>User: {event.userEmail}</span>
                      <span>IP: {event.ipAddress}</span>
                      <span>Time: {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {securityAlerts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-red-800">{alert.action}</p>
                    <p className="text-sm text-red-600">{alert.details}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}